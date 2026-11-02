import "server-only";
import { cookies } from "next/headers";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { STORES, type MarketCode, type StoreKey } from "./stores";
import { getCurrentUser, randomToken, sha256 } from "./auth";
import { optionsDelta, basePrice, type PricedOption, type SelectionInput } from "./pricing";

const cartCookie = (market: MarketCode) => `f3d_cart_${market.toLowerCase()}`;

/** Localiza (e opcionalmente cria) o carrinho do mercado atual. Carrinhos de BR e CA nunca se misturam. */
export async function findCart(store: StoreKey, create = false) {
  const { market } = STORES[store];
  const user = await getCurrentUser();
  if (user) {
    const existing = await db.query.carts.findFirst({ where: and(eq(s.carts.userId, user.id), eq(s.carts.market, market)) });
    if (existing || !create) return existing ?? null;
    const [c] = await db.insert(s.carts).values({ userId: user.id, market }).returning();
    return c;
  }
  const jar = await cookies();
  const token = jar.get(cartCookie(market))?.value;
  if (token) {
    const c = await db.query.carts.findFirst({ where: and(eq(s.carts.tokenHash, sha256(token)), eq(s.carts.market, market)) });
    if (c) return c;
  }
  if (!create) return null;
  const newToken = randomToken();
  const [c] = await db.insert(s.carts).values({ tokenHash: sha256(newToken), market }).returning();
  jar.set(cartCookie(market), newToken, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 60, secure: process.env.NODE_ENV === "production" });
  return c;
}

/** Ao entrar na conta, junta o carrinho de visitante de cada mercado ao carrinho do usuário. */
export async function mergeGuestCarts(userId: string) {
  const jar = await cookies();
  for (const market of ["BR", "CA"] as const) {
    const token = jar.get(cartCookie(market))?.value;
    if (!token) continue;
    const guest = await db.query.carts.findFirst({
      where: and(eq(s.carts.tokenHash, sha256(token)), isNull(s.carts.userId)), with: { items: true },
    });
    jar.delete(cartCookie(market));
    if (!guest) continue;
    let userCart = await db.query.carts.findFirst({ where: and(eq(s.carts.userId, userId), eq(s.carts.market, market)) });
    if (!userCart) {
      await db.update(s.carts).set({ userId, tokenHash: null }).where(eq(s.carts.id, guest.id));
      continue;
    }
    for (const it of guest.items) {
      await db.insert(s.cartItems)
        .values({ cartId: userCart.id, productId: it.productId, quantity: it.quantity, selections: it.selections, signature: it.signature, notes: it.notes })
        .onConflictDoUpdate({ target: [s.cartItems.cartId, s.cartItems.productId, s.cartItems.signature], set: { quantity: it.quantity } });
    }
    if (!userCart.couponCode && guest.couponCode) {
      await db.update(s.carts).set({ couponCode: guest.couponCode }).where(eq(s.carts.id, userCart.id));
    }
    await db.delete(s.carts).where(eq(s.carts.id, guest.id));
    userCart = undefined;
  }
}

export type CartLine = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  selectionLabels: { label: string; value: string; hex?: string | null }[];
  notes: string | null;
  available: boolean;
  maxQty: number;
};

/** Monta as linhas do carrinho com preços recalculados no servidor (nunca confiamos no cliente). */
export async function getCartLines(store: StoreKey, cartId: string): Promise<CartLine[]> {
  const { market, locale } = STORES[store];
  const items = await db.query.cartItems.findMany({
    where: eq(s.cartItems.cartId, cartId),
    orderBy: (t, { asc }) => asc(t.createdAt),
  });
  if (!items.length) return [];
  const pids = [...new Set(items.map((i) => i.productId))];
  const products = await db.query.products.findMany({
    where: inArray(s.products.id, pids),
    with: {
      translations: true, markets: true, images: { orderBy: (t, { asc }) => asc(t.sortOrder), limit: 1 },
      options: { with: { values: true } },
    },
  });
  return items.map((it) => {
    const p = products.find((x) => x.id === it.productId)!;
    const tr = p.translations.find((t) => t.locale === locale)!;
    const pm = p.markets.find((m) => m.market === market);
    const options: PricedOption[] = p.options.map((o) => ({
      id: o.id, kind: o.kind, required: o.required, label: (o.labels as Record<string, string>)[locale] ?? "",
      maxLength: o.maxLength, textPriceDelta: (o.textPriceDelta as Record<string, number> | null)?.[market] ?? 0,
      values: o.values.map((v) => ({ code: v.code, hex: v.hex, label: (v.labels as Record<string, string>)[locale] ?? v.code, priceDelta: (v.priceDelta as Record<string, number>)[market] ?? 0 })),
    }));
    const sels = it.selections as SelectionInput[];
    const unit = pm ? basePrice(pm.price, pm.salePrice) + optionsDelta(options, sels) : 0;
    const labels = sels.map((sel) => {
      const opt = options.find((o) => o.id === sel.optionId);
      const v = opt?.values.find((x) => x.code === sel.valueCode);
      return { label: opt?.label ?? "", value: sel.text ?? v?.label ?? "", hex: v?.hex };
    });
    return {
      id: it.id, productId: p.id, name: tr.name, slug: tr.slug, image: p.images[0]?.url ?? null, quantity: it.quantity,
      unitPrice: unit, lineTotal: unit * it.quantity, selectionLabels: labels, notes: it.notes,
      available: !!pm?.active, maxQty: 20,
    };
  });
}

export async function getCartCount(store: StoreKey) {
  const cart = await findCart(store);
  if (!cart) return 0;
  const items = await db.select({ q: s.cartItems.quantity }).from(s.cartItems).where(eq(s.cartItems.cartId, cart.id));
  return items.reduce((a, i) => a + i.q, 0);
}

// ───────── Totais: cupom, frete e impostos ─────────

export type ShippingQuote = { code: string; label: string; carrier: string; cost: number; minDays: number; maxDays: number; pickup?: boolean };
export type TaxLineOut = { code: string; label: string; rate: number; amount: number };

export const CA_PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"] as const;

/** Província aproximada a partir do código postal canadense (primeira letra). */
export function provinceFromPostal(postal: string): string | null {
  const first = postal.trim().toUpperCase()[0];
  const map: Record<string, string> = {
    A: "NL", B: "NS", C: "PE", E: "NB", G: "QC", H: "QC", J: "QC", K: "ON", L: "ON", M: "ON", N: "ON", P: "ON",
    R: "MB", S: "SK", T: "AB", V: "BC", X: "NT", Y: "YT",
  };
  return map[first] ?? null;
}

export function validPostal(market: MarketCode, postal: string) {
  return market === "BR" ? /^\d{5}-?\d{3}$/.test(postal.trim()) : /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postal.trim());
}

export async function computeTotals(
  store: StoreKey,
  lines: CartLine[],
  opts: { couponCode?: string | null; postalCode?: string | null; province?: string | null; shippingCode?: string | null },
) {
  const { market, locale } = STORES[store];
  const avail = lines.filter((l) => l.available);
  const subtotal = avail.reduce((a, l) => a + l.lineTotal, 0);
  const qty = avail.reduce((a, l) => a + l.quantity, 0);
  const unit = await db.query.storeUnits.findFirst({ where: eq(s.storeUnits.market, market) });

  // Cupom
  let discount = 0;
  let freeShippingCoupon = false;
  let couponError: "invalid" | "min" | null = null;
  let couponMin = 0;
  if (opts.couponCode) {
    const c = await db.query.coupons.findFirst({ where: and(eq(s.coupons.code, opts.couponCode.toUpperCase()), eq(s.coupons.market, market), eq(s.coupons.active, true)) });
    const now = new Date();
    if (!c || (c.startsAt && c.startsAt > now) || (c.endsAt && c.endsAt < now) || (c.maxUses != null && c.usedCount >= c.maxUses)) {
      couponError = "invalid";
    } else if (c.minSubtotal && subtotal < c.minSubtotal) {
      couponError = "min";
      couponMin = c.minSubtotal;
    } else if (c.type === "PERCENT") discount = Math.round((subtotal * c.value) / 100);
    else if (c.type === "FIXED") discount = Math.min(c.value, subtotal);
    else freeShippingCoupon = true;
  }

  // Frete (tabela da unidade até a integração com transportadoras)
  const afterDiscount = subtotal - discount;
  const freeShipping = freeShippingCoupon || (!!unit?.freeShippingMin && afterDiscount >= unit.freeShippingMin);
  let shippingOptions: ShippingQuote[] = [];
  const postalOk = !!opts.postalCode && validPostal(market, opts.postalCode);
  if (unit && postalOk && qty > 0) {
    shippingOptions = unit.shippingRules.map((r, idx) => ({
      code: r.code, carrier: r.carrier, label: r.labels[locale] ?? r.code,
      cost: freeShipping && idx === 0 ? 0 : r.baseCents + r.perItemCents * Math.max(0, qty - 1),
      minDays: r.minDays, maxDays: r.maxDays,
    }));
    if (unit.pickupEnabled) shippingOptions.push({ code: "pickup", carrier: "", label: "pickup", cost: 0, minDays: 0, maxDays: 0, pickup: true });
  }
  const selectedShipping = shippingOptions.find((o) => o.code === opts.shippingCode) ?? shippingOptions[0] ?? null;
  const shippingCost = selectedShipping?.cost ?? 0;

  // Impostos: BR = incluídos no preço; CA = GST/HST + provinciais, sobre produtos + frete
  const taxLines: TaxLineOut[] = [];
  let province = opts.province ?? (opts.postalCode && market === "CA" ? provinceFromPostal(opts.postalCode) : null);
  if (market === "CA" && province) {
    const rates = await db.query.taxRates.findMany({ where: eq(s.taxRates.market, "CA") });
    const hst = rates.find((r) => r.region === province && r.code === "HST");
    const applicable = hst ? [hst] : rates.filter((r) => r.region === "*" || r.region === province);
    const base = afterDiscount + shippingCost;
    for (const r of applicable) {
      const rate = Number(r.rate);
      taxLines.push({ code: r.code, label: (r.labels as Record<string, string>)[locale] ?? r.code, rate, amount: Math.round(base * rate) });
    }
  } else province = province ?? null;
  const taxTotal = taxLines.reduce((a, t) => a + t.amount, 0);

  return {
    subtotal, discount, shippingCost, taxTotal, taxLines, province,
    total: afterDiscount + shippingCost + taxTotal,
    shippingOptions, selectedShipping, freeShipping,
    freeShippingMin: unit?.freeShippingMin ?? null,
    pickupAddress: unit?.pickupAddress ?? null,
    couponError, couponMin, postalOk, taxesIncluded: market === "BR",
  };
}
