"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Minus, Plus } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { addToCart } from "@/app/actions/cart";
import { formatMoney } from "@/lib/format";
import { unitPrice, type PricedOption, type SelectionInput } from "@/lib/pricing";
import { href } from "@/lib/stores";
import { fmt } from "@/i18n";

export function ProductConfigurator({ productId, price, salePrice, options, available }: {
  productId: string; price: number; salePrice: number | null; options: PricedOption[]; available: boolean;
}) {
  const { store, m } = useI18n();
  const p = m.product;
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.filter((o) => o.kind !== "TEXT" && o.values[0]).map((o) => [o.id, o.values[0].code])));
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [pending, start] = useTransition();

  const selections: SelectionInput[] = useMemo(() => options.map((o) =>
    o.kind === "TEXT" ? { optionId: o.id, kind: o.kind, text: texts[o.id] ?? "" } : { optionId: o.id, kind: o.kind, valueCode: values[o.id] },
  ), [options, values, texts]);
  const unit = unitPrice(price, salePrice, options, selections);
  const base = salePrice ?? price;

  const submit = (buyNow: boolean) => {
    const missing = options.find((o) => o.kind === "TEXT" && o.required && !(texts[o.id] ?? "").trim());
    if (missing) { setError(fmt(p.selectOption, { option: missing.label.toLowerCase() })); document.getElementById(`opt-${missing.id}`)?.focus(); return; }
    setError(null);
    start(async () => {
      const r = await addToCart(store, { productId, quantity: qty, selections, notes: notes.trim() || undefined });
      if (!r.ok) { setError(r.error === "unavailable" ? p.notAvailableInRegion : m.common.errorGeneric); return; }
      if (buyNow) router.push(href(store, "cart"));
      else { setAdded(true); router.refresh(); }
    });
  };

  if (!available) {
    return <p className="rounded-2xl bg-metal p-4 text-sm" role="status">{p.notAvailableInRegion}</p>;
  }

  return (
    <div className="space-y-6">
      {options.length > 0 && <h2 className="sr-only">{p.options}</h2>}
      {options.map((o) => {
        if (o.kind === "PRIMARY_COLOR" || o.kind === "SECONDARY_COLOR") {
          const sel = o.values.find((v) => v.code === values[o.id]);
          return (
            <fieldset key={o.id}>
              <legend className="mb-2.5 text-sm"><span className="font-semibold">{o.label}</span>{sel && <span className="text-mute">: {sel.label}</span>}</legend>
              <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={o.label}>
                {o.values.map((v) => {
                  const on = values[o.id] === v.code;
                  return (
                    <button key={v.code} type="button" role="radio" aria-checked={on} aria-label={v.label} title={v.label}
                      onClick={() => setValues((s) => ({ ...s, [o.id]: v.code }))} data-testid={`swatch-${o.kind}-${v.code}`}
                      className={`relative h-10 w-10 rounded-full ring-offset-2 transition ${on ? "ring-2 ring-ink" : "ring-1 ring-ink/15 hover:ring-ink/40"}`}
                      style={{ background: v.hex ?? "#ccc" }}>
                      {on && <Check className={`absolute inset-0 m-auto h-4 w-4 ${["#F1F1F3", "#D8C3A5", "#F2C14E", "#9DB59A"].includes(v.hex ?? "") ? "text-ink" : "text-white"}`} aria-hidden />}
                      {v.priceDelta > 0 && <span className="sr-only">{fmt(p.priceIncrease, { price: formatMoney(v.priceDelta, store) })}</span>}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        }
        if (o.kind === "SIZE" || o.kind === "FINISH") {
          return (
            <fieldset key={o.id}>
              <legend className="mb-2.5 text-sm font-semibold">{o.label}</legend>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={o.label}>
                {o.values.map((v) => {
                  const on = values[o.id] === v.code;
                  return (
                    <button key={v.code} type="button" role="radio" aria-checked={on} onClick={() => setValues((s) => ({ ...s, [o.id]: v.code }))}
                      data-testid={`opt-${o.kind}-${v.code}`}
                      className={`rounded-2xl border px-4 py-2.5 text-left text-sm transition-colors ${on ? "border-ink bg-ink text-metal" : "border-ink/15 hover:border-ink/40"}`}>
                      <span className="block font-medium">{v.label}</span>
                      {v.priceDelta > 0 && <span className={`block text-xs ${on ? "text-metal/70" : "text-mute"}`}>{fmt(p.priceIncrease, { price: formatMoney(v.priceDelta, store) })}</span>}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        }
        return (
          <div key={o.id}>
            <label htmlFor={`opt-${o.id}`} className="field-label">{o.label}{o.textPriceDelta > 0 && <span className="font-normal text-mute"> ({fmt(p.priceIncrease, { price: formatMoney(o.textPriceDelta, store) })})</span>}</label>
            <input id={`opt-${o.id}`} className="field" maxLength={o.maxLength ?? 40} value={texts[o.id] ?? ""} data-testid="custom-text"
              aria-invalid={!!error && !(texts[o.id] ?? "").trim()} aria-describedby={`hint-${o.id}`}
              onChange={(e) => setTexts((s) => ({ ...s, [o.id]: e.target.value }))} />
            <p id={`hint-${o.id}`} className="field-hint">{fmt(p.customTextHint, { max: o.maxLength ?? 40 })} {(texts[o.id] ?? "").length}/{o.maxLength}</p>
          </div>
        );
      })}

      <div>
        <label htmlFor="notes" className="field-label">{p.notes} <span className="font-normal text-mute">({m.common.optional})</span></label>
        <textarea id="notes" rows={2} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={p.notesPlaceholder} className="field resize-y" />
      </div>

      <div className="rounded-[1.75rem] bg-metal p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-mute">{p.finalPrice}</p>
            <p className="font-display text-2xl font-semibold tabular-nums" aria-live="polite" data-testid="final-price">{formatMoney(unit * qty, store)}</p>
            {unit !== base && <p className="text-xs text-mute">{formatMoney(base, store)} + {formatMoney(unit - base, store)}</p>}
          </div>
          <div className="flex items-center rounded-full bg-white p-1" role="group" aria-label={p.quantity}>
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-metal disabled:opacity-40" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label={m.cart.decrease}><Minus className="h-4 w-4" /></button>
            <span className="w-8 text-center font-medium tabular-nums" aria-live="polite" data-testid="qty">{qty}</span>
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-metal disabled:opacity-40" onClick={() => setQty((q) => Math.min(20, q + 1))} disabled={qty >= 20} aria-label={m.cart.increase}><Plus className="h-4 w-4" /></button>
          </div>
        </div>
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button type="button" className="btn-ink h-12" disabled={pending} onClick={() => submit(false)} data-testid="add-to-cart">{pending ? m.common.loading : p.addToCart}</button>
          <button type="button" className="btn-volt h-12" disabled={pending} onClick={() => submit(true)} data-testid="buy-now">{p.buyNow}</button>
        </div>
        {added && (
          <div className="pop-in mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 text-sm" role="status" data-testid="added-toast">
            <span className="flex items-center gap-2 font-medium"><Check className="h-4 w-4 text-ok" aria-hidden />{p.added}</span>
            <Link href={href(store, "cart")} className="font-medium text-teal hover:underline">{p.goToCart}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
