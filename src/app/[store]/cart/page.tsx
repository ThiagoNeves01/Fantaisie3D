import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { ShoppingBag } from "lucide-react";
import { resolveStore } from "@/lib/request";
import { CA_PROVINCES, computeTotals, findCart, getCartLines } from "@/lib/cart";
import { languageAlternates } from "@/lib/alternates";
import { formatMoney } from "@/lib/format";
import { href, STORES } from "@/lib/stores";
import { fmt } from "@/i18n";
import { CartQty, CouponForm, ShippingEstimator } from "@/components/cart-controls";

export async function generateMetadata({ params }: PageProps<"/[store]/cart">): Promise<Metadata> {
  const { store, m } = await resolveStore(params);
  return { title: m.cart.title, robots: { index: false }, alternates: await languageAlternates(store, ["cart"]) };
}

export default async function CartPage({ params, searchParams }: PageProps<"/[store]/cart">) {
  const { store, m } = await resolveStore(params);
  const sp = await searchParams;
  const c = m.cart;
  const cfg = STORES[store];
  const cart = await findCart(store);
  const lines = cart ? await getCartLines(store, cart.id) : [];
  const jar = await cookies();
  const postal = (typeof sp.postal === "string" ? sp.postal : jar.get(`f3d_postal_${cfg.market}`)?.value) ?? "";
  const province = typeof sp.province === "string" && (CA_PROVINCES as readonly string[]).includes(sp.province) ? sp.province : null;
  const ship = typeof sp.ship === "string" ? sp.ship : null;
  const totals = await computeTotals(store, lines, { couponCode: cart?.couponCode, postalCode: postal, province, shippingCode: ship });

  if (!lines.length) {
    return (
      <div className="container-x py-24 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-metal"><ShoppingBag className="h-8 w-8 text-mute" aria-hidden /></span>
        <h1 className="mt-6 text-3xl font-semibold" data-testid="cart-empty">{c.empty}</h1>
        <p className="mt-2 text-mute">{c.emptyText}</p>
        <Link href={href(store, "products")} className="btn-ink mt-8">{m.home.ctaExplore}</Link>
      </div>
    );
  }

  const remaining = totals.freeShippingMin ? Math.max(0, totals.freeShippingMin - (totals.subtotal - totals.discount)) : null;

  return (
    <div className="on-light container-x py-10 sm:py-14">
      <h1 className="text-3xl font-semibold sm:text-[2.4rem]">{c.title}</h1>
      <p className="mt-2 text-sm text-mute">{c.marketNote}</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
        <section aria-label={c.item}>
          <ul className="divide-y divide-ink/8 border-y border-ink/8" data-testid="cart-lines">
            {lines.map((l) => (
              <li key={l.id} className="flex gap-4 py-6 sm:gap-6" data-testid="cart-line">
                <Link href={href(store, "product", l.slug)} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-metal sm:h-32 sm:w-32">
                  {l.image && <Image src={l.image} alt="" fill sizes="128px" className="object-cover" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display font-medium"><Link href={href(store, "product", l.slug)} className="hover:text-teal">{l.name}</Link></h2>
                      <ul className="mt-1.5 space-y-0.5 text-sm text-mute">
                        {l.selectionLabels.map((s) => (
                          <li key={s.label} className="flex items-center gap-1.5">
                            {s.hex && <span className="h-3 w-3 rounded-full ring-1 ring-ink/15" style={{ background: s.hex }} aria-hidden />}
                            {s.label}: <span className="text-ink">{s.value}</span>
                          </li>
                        ))}
                        {l.notes && <li>{m.product.notes}: <span className="text-ink">{l.notes}</span></li>}
                      </ul>
                      {!l.available && <p className="mt-1 text-sm text-danger">{c.productUnavailable}</p>}
                    </div>
                    <p className="font-display font-semibold tabular-nums" data-testid="line-total">{formatMoney(l.lineTotal, store)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                    <CartQty itemId={l.id} qty={l.quantity} name={l.name} />
                    <p className="text-xs text-mute">{c.unitPrice}: {formatMoney(l.unitPrice, store)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link href={href(store, "products")} className="mt-6 inline-block text-sm font-medium text-teal hover:underline">{m.product.continueShopping}</Link>
        </section>

        <aside aria-label={c.total} className="h-fit rounded-[2rem] bg-metal p-6 lg:sticky lg:top-24">
          {remaining !== null && (
            <div className="mb-5">
              <p className="text-sm">{remaining > 0 ? fmt(c.freeShippingProgress, { amount: formatMoney(remaining, store) }) : c.freeShippingReached}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white" aria-hidden>
                <div className="h-full rounded-full bg-teal" style={{ width: `${Math.min(100, ((totals.subtotal - totals.discount) / totals.freeShippingMin!) * 100)}%` }} />
              </div>
            </div>
          )}

          <ShippingEstimator
            postal={postal}
            province={totals.province}
            selected={totals.selectedShipping?.code ?? null}
            options={totals.shippingOptions.map((o) => ({
              code: o.code,
              label: o.pickup ? c.pickup : fmt(c.shippingOption, { name: o.label, days: fmt(c.shippingDays, { min: o.minDays, max: o.maxDays }) }),
              detail: o.pickup ? fmt(c.pickupText, { address: totals.pickupAddress ?? "" }) : null,
              cost: o.cost === 0 ? c.shippingFree : formatMoney(o.cost, store),
            }))}
            invalid={!!postal && !totals.postalOk}
          />

          <CouponForm code={cart?.couponCode ?? null} error={totals.couponError === "invalid" ? c.couponInvalid : totals.couponError === "min" ? fmt(c.couponMin, { amount: formatMoney(totals.couponMin, store) }) : null} />

          <dl className="mt-6 space-y-2.5 border-t border-ink/10 pt-5 text-sm" data-testid="totals">
            <div className="flex justify-between"><dt>{c.subtotal}</dt><dd className="tabular-nums" data-testid="subtotal">{formatMoney(totals.subtotal, store)}</dd></div>
            {totals.discount > 0 && <div className="flex justify-between text-ok"><dt>{c.discount}</dt><dd className="tabular-nums" data-testid="discount">−{formatMoney(totals.discount, store)}</dd></div>}
            <div className="flex justify-between"><dt>{c.shipping}</dt><dd className="tabular-nums">{totals.selectedShipping ? (totals.shippingCost ? formatMoney(totals.shippingCost, store) : c.shippingFree) : c.shippingFrom}</dd></div>
            {cfg.market === "CA" ? (
              totals.taxLines.length ? totals.taxLines.map((t) => (
                <div key={t.code} className="flex justify-between"><dt>{t.label} ({(t.rate * 100).toLocaleString(cfg.locale, { maximumFractionDigits: 3 })} %)</dt><dd className="tabular-nums" data-testid={`tax-${t.code}`}>{formatMoney(t.amount, store)}</dd></div>
              )) : <div className="flex justify-between text-mute"><dt>{c.taxes}</dt><dd>{m.product.taxesExtra}</dd></div>
            ) : (
              <div className="flex justify-between text-mute"><dt>{c.taxes}</dt><dd>{c.taxesIncluded}</dd></div>
            )}
            <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-semibold"><dt>{c.total}</dt><dd className="font-display tabular-nums" data-testid="total">{formatMoney(totals.total, store)}</dd></div>
          </dl>
          <p className="mt-2 text-xs text-mute">{c.estimateNote}</p>
          <button type="button" className="btn-volt mt-5 h-12 w-full" disabled aria-describedby="checkout-soon">{c.checkout}</button>
          <p id="checkout-soon" className="mt-2 text-xs text-mute">{c.checkoutSoon}</p>
          <p className="mt-3 text-xs text-mute">{m.auth.guestCheckout}</p>
        </aside>
      </div>
    </div>
  );
}
