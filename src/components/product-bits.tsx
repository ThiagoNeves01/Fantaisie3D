import { Star } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { StoreKey } from "@/lib/stores";
import { fmt, type Messages } from "@/i18n";

export function Price({ store, price, salePrice, m, size = "md" }: { store: StoreKey; price: number; salePrice: number | null; m: Messages; size?: "md" | "lg" }) {
  const onSale = salePrice != null && salePrice < price;
  const main = size === "lg" ? "text-3xl" : "text-[1.05rem]";
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-display font-semibold tabular-nums ${main} ${onSale ? "text-teal-ink" : "text-ink"}`}>
        {onSale && <span className="sr-only">{m.product.salePrice}: </span>}
        {formatMoney(onSale ? salePrice : price, store)}
      </span>
      {onSale && (
        <s className={`tabular-nums text-mute ${size === "lg" ? "text-base" : "text-sm"}`}>
          <span className="sr-only">{fmt(m.product.wasPrice, { price: "" })}</span>{formatMoney(price, store)}
        </s>
      )}
    </p>
  );
}

export function Stars({ value, count, m, small = false }: { value: number; count: number; m: Messages; small?: boolean }) {
  if (!count) return <p className="text-xs text-mute">{m.common.noReviews}</p>;
  const label = fmt(m.common.rating, { value: value.toFixed(1) });
  return (
    <p className="flex items-center gap-1.5" title={label}>
      <span className="flex" role="img" aria-label={label}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`${small ? "h-3.5 w-3.5" : "h-4 w-4"} ${i <= Math.round(value) ? "fill-ink text-ink" : "fill-transparent text-ink/25"}`} aria-hidden />
        ))}
      </span>
      <span className="text-xs text-mute">{count === 1 ? m.common.review1 : fmt(m.common.reviews, { count })}</span>
    </p>
  );
}

export function Badges({ p, m }: { p: { isNew: boolean; salePrice: number | null; price: number; isBestseller?: boolean; madeToOrder?: boolean }; m: Messages }) {
  const list: { label: string; tone: string }[] = [];
  if (p.salePrice != null && p.salePrice < p.price) {
    const pct = Math.round((1 - p.salePrice / p.price) * 100);
    list.push({ label: `${m.badges.sale} −${pct}%`, tone: "bg-volt text-ink" });
  }
  if (p.isNew) list.push({ label: m.badges.new, tone: "bg-ink text-metal" });
  if (p.isBestseller && list.length < 2) list.push({ label: m.badges.bestseller, tone: "bg-white text-ink ring-1 ring-ink/10" });
  if (!list.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {list.map((b) => <li key={b.label} className={`rounded-full px-2.5 py-1 text-[0.72rem] font-semibold ${b.tone}`}>{b.label}</li>)}
    </ul>
  );
}
