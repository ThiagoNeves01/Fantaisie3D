import Image from "next/image";
import { Flag } from "./flags";
import { ReorderButton } from "./reorder-button";
import { formatDate, formatMoney } from "@/lib/format";
import { PRODUCTION_STEPS } from "@/lib/orders";
import { storeForLocale, STORES, type StoreKey } from "@/lib/stores";
import { fmt, type Messages } from "@/i18n";
import type { getUserOrders } from "@/lib/orders";

type Order = Awaited<ReturnType<typeof getUserOrders>>[number];

/** Pedido com linha do tempo da produção 3D (recebido → impressão → acabamento → envio). */
export function OrderCard({ o, store, m }: { o: Order; store: StoreKey; m: Messages }) {
  const a = m.account;
  // valores sempre na moeda da operação em que o pedido foi feito
  const orderStore: StoreKey = o.market === STORES[store].market ? store : storeForLocale(o.locale);
  const step = PRODUCTION_STEPS.indexOf(o.productionStatus);
  const cancelled = o.status === "CANCELLED" || o.status === "REFUNDED";
  return (
    <article className="rounded-[1.75rem] border border-ink/8 p-5 sm:p-6" data-testid="order-card">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Flag market={o.market} className="h-3.5 w-5 rounded-[2px]" />{fmt(a.order, { number: o.number })}
          </h3>
          <p className="text-sm text-mute">{fmt(a.orderDate, { date: formatDate(o.createdAt, store) })}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-semibold tabular-nums">{formatMoney(o.total, orderStore)}</p>
          <p className={`text-sm ${cancelled ? "text-danger" : "text-mute"}`}>{m.orderStatus[o.status]}</p>
        </div>
      </header>

      <ul className="mt-5 flex flex-wrap gap-3">
        {o.items.map((it) => (
          <li key={it.id} className="flex items-center gap-3 rounded-2xl bg-metal py-2 pr-4 pl-2">
            {it.image && <Image src={it.image} alt="" width={48} height={48} className="h-12 w-12 rounded-xl bg-white object-cover" />}
            <span className="text-sm"><span className="font-medium">{it.quantity}×</span> {it.name}
              {it.selectionLabels.length > 0 && <span className="block text-xs text-mute">{it.selectionLabels.join(", ")}</span>}
            </span>
          </li>
        ))}
      </ul>

      {!cancelled && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold">{a.production}: <span className="font-normal">{m.production[o.productionStatus]}</span></p>
          <ol className="grid grid-cols-7 gap-1" aria-label={a.production}>
            {PRODUCTION_STEPS.map((s, i) => (
              <li key={s} className="flex flex-col gap-1.5">
                <span className={`h-1.5 rounded-full ${i <= step ? "bg-teal" : "bg-metal-2"}`} aria-hidden />
                <span className={`hidden text-[0.68rem] leading-tight md:block ${i === step ? "font-semibold text-ink" : "text-mute"}`}>{m.production[s]}</span>
                <span className="sr-only">{m.production[s]}{i <= step ? " ✓" : ""}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink/8 pt-4 text-sm">
        {o.shipment?.trackingCode ? (
          <p>{a.trackingCode}: {o.shipment.trackingUrl
            ? <a href={o.shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="link font-mono">{o.shipment.trackingCode}</a>
            : <span className="font-mono">{o.shipment.trackingCode}</span>} <span className="text-mute">({o.shipment.carrier})</span></p>
        ) : <span />}
        {o.market === STORES[store].market && <ReorderButton orderId={o.id} />}
      </footer>
    </article>
  );
}
