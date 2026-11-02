"use server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema as s } from "@/db";
import { findCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { validateSelections, selectionSignature, type PricedOption, type SelectionInput } from "@/lib/pricing";
import { assertStore } from "@/lib/request";
import { STORES } from "@/lib/stores";

const addSchema = z.object({
  productId: z.string().min(1).max(64),
  quantity: z.number().int().min(1).max(20),
  selections: z.array(z.object({
    optionId: z.string().max(64), kind: z.string().max(32),
    valueCode: z.string().max(32).optional(), text: z.string().max(80).optional(),
  })).max(10),
  notes: z.string().max(500).optional(),
  useDefaults: z.boolean().optional(),
});

export type CartActionResult = { ok: true; count: number } | { ok: false; error: "invalid" | "unavailable" | "options" };

async function loadOptions(productId: string, store: ReturnType<typeof assertStore>): Promise<{ options: PricedOption[]; active: boolean } | null> {
  const { market, locale } = STORES[store];
  const p = await db.query.products.findFirst({
    where: eq(s.products.id, productId),
    with: { markets: true, options: { with: { values: true } } },
  });
  if (!p) return null;
  const pm = p.markets.find((m) => m.market === market);
  return {
    active: !!pm?.active,
    options: p.options.map((o) => ({
      id: o.id, kind: o.kind, required: o.required, label: (o.labels as Record<string, string>)[locale] ?? "",
      maxLength: o.maxLength, textPriceDelta: 0,
      values: o.values.map((v) => ({ code: v.code, hex: v.hex, label: v.code, priceDelta: 0 })),
    })),
  };
}

async function countItems(cartId: string) {
  const rows = await db.select({ q: s.cartItems.quantity }).from(s.cartItems).where(eq(s.cartItems.cartId, cartId));
  return rows.reduce((a, r) => a + r.q, 0);
}

export async function addToCart(storeArg: string, input: z.infer<typeof addSchema>): Promise<CartActionResult> {
  const store = assertStore(storeArg);
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { productId, quantity, notes } = parsed.data;
  const loaded = await loadOptions(productId, store);
  if (!loaded || !loaded.active) return { ok: false, error: "unavailable" };
  const selections = validateSelections(loaded.options, parsed.data.selections as SelectionInput[], parsed.data.useDefaults);
  if (!selections) return { ok: false, error: "options" };
  const cart = (await findCart(store, true))!;
  const signature = selectionSignature(selections) + (notes?.trim() ? `|n:${notes.trim()}` : "");
  const existing = await db.query.cartItems.findFirst({
    where: and(eq(s.cartItems.cartId, cart.id), eq(s.cartItems.productId, productId), eq(s.cartItems.signature, signature)),
  });
  if (existing) {
    await db.update(s.cartItems).set({ quantity: Math.min(20, existing.quantity + quantity) }).where(eq(s.cartItems.id, existing.id));
  } else {
    await db.insert(s.cartItems).values({ cartId: cart.id, productId, quantity, selections, signature, notes: notes?.trim() || null });
  }
  revalidatePath(`/${store}`, "layout");
  return { ok: true, count: await countItems(cart.id) };
}

export async function updateCartItem(storeArg: string, itemId: string, quantity: number) {
  const store = assertStore(storeArg);
  const cart = await findCart(store);
  if (!cart) return;
  const q = Math.max(0, Math.min(20, Math.floor(quantity)));
  // A condição cartId garante que só o dono do carrinho altere o item
  if (q === 0) await db.delete(s.cartItems).where(and(eq(s.cartItems.id, itemId), eq(s.cartItems.cartId, cart.id)));
  else await db.update(s.cartItems).set({ quantity: q }).where(and(eq(s.cartItems.id, itemId), eq(s.cartItems.cartId, cart.id)));
  revalidatePath(`/${store}`, "layout");
}

export async function applyCoupon(storeArg: string, code: string | null) {
  const store = assertStore(storeArg);
  const cart = await findCart(store, !!code);
  if (!cart) return;
  const clean = code ? code.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 32) : null;
  await db.update(s.carts).set({ couponCode: clean || null }).where(eq(s.carts.id, cart.id));
  revalidatePath(`/${store}`, "layout");
}

/** "Comprar novamente": adiciona ao carrinho os itens de um pedido anterior do próprio usuário. */
export async function reorder(storeArg: string, orderId: string) {
  const store = assertStore(storeArg);
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  const order = await db.query.orders.findFirst({
    where: and(eq(s.orders.id, orderId), eq(s.orders.userId, user.id), eq(s.orders.market, STORES[store].market)),
    with: { items: true },
  });
  if (!order) return { ok: false };
  for (const it of order.items) {
    if (!it.productId) continue;
    await addToCart(store, { productId: it.productId, quantity: it.quantity, selections: it.selections, notes: it.notes ?? undefined });
  }
  return { ok: true };
}
