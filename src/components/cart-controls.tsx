"use client";
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { applyCoupon, updateCartItem } from "@/app/actions/cart";
import { STORES } from "@/lib/stores";
import { fmt } from "@/i18n";

export function CartQty({ itemId, qty, name }: { itemId: string; qty: number; name: string }) {
  const { store, m } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const set = (q: number) => start(async () => { await updateCartItem(store, itemId, q); router.refresh(); });
  return (
    <div className="flex items-center gap-2" aria-busy={pending}>
      <div className="flex items-center rounded-full border border-ink/12" role="group" aria-label={`${m.cart.quantity}: ${name}`}>
        <button type="button" disabled={pending || qty <= 1} onClick={() => set(qty - 1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-metal disabled:opacity-40" aria-label={m.cart.decrease}><Minus className="h-3.5 w-3.5" /></button>
        <span className="w-7 text-center text-sm tabular-nums" data-testid="line-qty">{qty}</span>
        <button type="button" disabled={pending || qty >= 20} onClick={() => set(qty + 1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-metal disabled:opacity-40" aria-label={m.cart.increase} data-testid="qty-plus"><Plus className="h-3.5 w-3.5" /></button>
      </div>
      <button type="button" disabled={pending} onClick={() => set(0)} className="flex h-9 w-9 items-center justify-center rounded-full text-mute hover:bg-metal hover:text-danger" aria-label={fmt(m.cart.remove, { name })} data-testid="remove-line">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function CouponForm({ code, error }: { code: string | null; error: string | null }) {
  const { store, m } = useI18n();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, start] = useTransition();
  const submit = (c: string | null) => start(async () => { await applyCoupon(store, c); setValue(""); router.refresh(); });

  if (code && !error) {
    return (
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm" role="status">
        <span>{fmt(m.cart.couponApplied, { code })}</span>
        <button type="button" onClick={() => submit(null)} className="flex items-center gap-1 text-mute hover:text-danger" aria-label={m.cart.removeCoupon}><X className="h-4 w-4" /></button>
      </div>
    );
  }
  return (
    <form className="mt-5" onSubmit={(e) => { e.preventDefault(); if (value.trim()) submit(value.trim()); }}>
      <label htmlFor="coupon" className="field-label">{m.cart.coupon}</label>
      <div className="flex gap-2">
        <input id="coupon" value={value} onChange={(e) => setValue(e.target.value.toUpperCase())} placeholder={m.cart.couponPlaceholder} className="field py-2.5 uppercase" maxLength={32} autoComplete="off" aria-invalid={!!error} data-testid="coupon-input" />
        <button className="btn-ink btn-sm shrink-0" disabled={pending} data-testid="coupon-apply">{m.cart.apply}</button>
      </div>
      {error && <p className="field-error" role="alert">{error}{code && <button type="button" className="ml-2 underline" onClick={() => submit(null)}>{m.cart.removeCoupon}</button>}</p>}
    </form>
  );
}

type Opt = { code: string; label: string; detail: string | null; cost: string };

export function ShippingEstimator({ postal, province, options, selected, invalid }: { postal: string; province: string | null; options: Opt[]; selected: string | null; invalid: boolean }) {
  const { store, m } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(postal);
  const [pending, start] = useTransition();
  const market = STORES[store].market;

  const go = (mut: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(window.location.search);
    mut(p);
    start(() => router.replace(`${pathname}?${p}`, { scroll: false }));
  };
  const mask = (v: string) => market === "BR"
    ? v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2")
    : v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6).replace(/^(.{3})(.)/, "$1 $2");

  return (
    <div aria-busy={pending}>
      <form onSubmit={(e) => {
        e.preventDefault();
        document.cookie = `f3d_postal_${market}=${encodeURIComponent(value)}; path=/; max-age=2592000; samesite=lax`;
        go((p) => { p.set("postal", value); p.delete("ship"); p.delete("province"); });
      }}>
        <label htmlFor="postal" className="field-label">{m.cart.shippingCalc}</label>
        <div className="flex gap-2">
          <input id="postal" value={value} onChange={(e) => setValue(mask(e.target.value))} placeholder={m.cart.postalCodePlaceholder} inputMode={market === "BR" ? "numeric" : "text"}
            autoComplete="postal-code" aria-label={m.cart.postalCode} aria-invalid={invalid} className="field py-2.5" data-testid="postal-input" />
          <button className="btn-ink btn-sm shrink-0" disabled={pending} data-testid="postal-submit">{m.cart.calculate}</button>
        </div>
        {invalid && <p className="field-error" role="alert">{m.cart.invalidPostal}</p>}
      </form>
      {market === "CA" && options.length > 0 && (
        <label className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span>{m.cart.province}</span>
          <select value={province ?? ""} onChange={(e) => go((p) => p.set("province", e.target.value))} className="h-10 rounded-full border border-ink/15 bg-white px-3 text-sm" data-testid="province-select">
            {["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"].map((pv) => <option key={pv}>{pv}</option>)}
          </select>
        </label>
      )}
      {options.length > 0 && (
        <fieldset className="mt-4 space-y-2" data-testid="shipping-options">
          <legend className="sr-only">{m.cart.shipping}</legend>
          {options.map((o) => (
            <label key={o.code} className={`flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-3 text-sm transition-colors ${selected === o.code ? "border-ink" : "border-transparent hover:border-ink/20"}`}>
              <input type="radio" name="ship" value={o.code} checked={selected === o.code} onChange={() => go((p) => p.set("ship", o.code))} className="mt-1 accent-[#087F89]" />
              <span className="flex-1">
                <span className="block">{o.label}</span>
                {o.detail && <span className="block text-xs text-mute">{o.detail}</span>}
              </span>
              <span className="font-medium tabular-nums">{o.cost}</span>
            </label>
          ))}
        </fieldset>
      )}
    </div>
  );
}
