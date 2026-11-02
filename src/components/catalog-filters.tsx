"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { href, STORES } from "@/lib/stores";
import { fmt } from "@/i18n";

type Facets = { priceMin: number; priceMax: number; colors: string[]; sizes: string[] };
type Cat = { key: string; name: string; slug: string; count: number };

const COLOR_HEX: Record<string, string> = {
  white: "#F1F1F3", black: "#1A1B1E", graphite: "#3A3E44", turquoise: "#00C9D4", petrol: "#087F89",
  sand: "#D8C3A5", terracotta: "#C8664A", lilac: "#A99BD6", sage: "#9DB59A", yellow: "#F2C14E",
};
const SIZE_LABEL: Record<string, string> = { S: "P / S", M: "M", L: "G / L" };

/** Filtros do catálogo: estado na URL (compartilhável), funciona com mouse, toque e teclado. */
export function CatalogFilters({ facets, categories, activeCategory, total }: { facets: Facets; categories: Cat[]; activeCategory?: string; total: number }) {
  const { store, m } = useI18n();
  const c = m.catalog;
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [drawer, setDrawer] = useState(false);
  const currency = STORES[store].currency === "BRL" ? "R$" : "$";
  // última consulta pedida: evita que cliques rápidos partam de uma URL ainda não atualizada
  const pendingQs = useRef<string | null>(null);
  useEffect(() => { pendingQs.current = null; }, [sp]);

  useEffect(() => { document.body.style.overflow = drawer ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [drawer]);

  const update = (mut: (p: URLSearchParams) => void) => {
    // lê a URL atual (e não o estado renderizado) para que cliques rápidos não usem filtros antigos
    const p = new URLSearchParams(pendingQs.current ?? window.location.search);
    mut(p);
    p.delete("page");
    pendingQs.current = p.toString();
    start(() => router.replace(`${pathname}${p.toString() ? `?${p}` : ""}`, { scroll: false }));
  };
  const toggleMulti = (key: string, val: string) => update((p) => {
    const cur = p.getAll(key); p.delete(key);
    (cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]).forEach((x) => p.append(key, x));
  });
  const toggleFlag = (key: string) => update((p) => (p.get(key) ? p.delete(key) : p.set(key, "1")));
  const applyPrice = (min: string, max: string) =>
    update((p) => { min ? p.set("min", min) : p.delete("min"); max ? p.set("max", max) : p.delete("max"); });
  const hasFilters = ["min", "max", "color", "size", "new", "best", "sale", "avail", "collection"].some((k) => sp.has(k));
  const keep = sp.get("q") ? `?q=${encodeURIComponent(sp.get("q")!)}` : "";

  const panel = (
    <div className="space-y-8" aria-busy={pending}>
      {!sp.get("q") && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">{c.category}</legend>
          <ul className="space-y-1">
            <li>
              <Link href={href(store, "products") + keep} aria-current={!activeCategory ? "page" : undefined}
                className={`flex justify-between rounded-xl px-3 py-2 text-sm ${!activeCategory ? "bg-ink text-metal" : "hover:bg-metal"}`}>
                {c.allProducts}
              </Link>
            </li>
            {categories.filter((x) => x.count > 0).map((cat) => (
              <li key={cat.key}>
                <Link href={href(store, "category", cat.slug)} aria-current={activeCategory === cat.slug ? "page" : undefined}
                  className={`flex justify-between gap-2 rounded-xl px-3 py-2 text-sm ${activeCategory === cat.slug ? "bg-ink text-metal" : "hover:bg-metal"}`}>
                  <span>{cat.name}</span><span className="tabular-nums opacity-60">{cat.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      <PriceRange key={`${sp.get("min") ?? ""}|${sp.get("max") ?? ""}`} initialMin={sp.get("min") ?? ""} initialMax={sp.get("max") ?? ""}
        facets={facets} currency={currency} onApply={applyPrice} />

      {facets.colors.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">{c.color}</legend>
          <ul className="flex flex-wrap gap-2">
            {facets.colors.map((col) => {
              const on = sp.getAll("color").includes(col);
              const label = m.colors[col as keyof typeof m.colors] ?? col;
              return (
                <li key={col}>
                  <button type="button" aria-pressed={on} onClick={() => toggleMulti("color", col)} title={label} data-testid={`color-${col}`}
                    className={`flex items-center gap-2 rounded-full border py-1.5 pr-3 pl-1.5 text-sm transition-colors ${on ? "border-ink bg-ink text-metal" : "border-ink/12 hover:border-ink/35"}`}>
                    <span className="h-5 w-5 rounded-full ring-1 ring-ink/15" style={{ background: COLOR_HEX[col] }} aria-hidden />{label}
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
      )}

      {facets.sizes.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">{c.size}</legend>
          <ul className="flex flex-wrap gap-2">
            {facets.sizes.map((z) => (
              <li key={z}>
                <button type="button" className="chip" aria-pressed={sp.getAll("size").includes(z)} onClick={() => toggleMulti("size", z)}>{SIZE_LABEL[z] ?? z}</button>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">{c.availability}</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={sp.get("avail") === "in_stock"} onClick={() => update((p) => (p.get("avail") === "in_stock" ? p.delete("avail") : p.set("avail", "in_stock")))} data-testid="avail-stock">{c.inStockOnly}</button>
          <button type="button" className="chip" aria-pressed={sp.get("avail") === "made_to_order"} onClick={() => update((p) => (p.get("avail") === "made_to_order" ? p.delete("avail") : p.set("avail", "made_to_order")))}>{c.madeToOrder}</button>
          <button type="button" className="chip" aria-pressed={!!sp.get("new")} onClick={() => toggleFlag("new")} data-testid="filter-new">{c.newOnly}</button>
          <button type="button" className="chip" aria-pressed={!!sp.get("best")} onClick={() => toggleFlag("best")}>{c.bestsellersOnly}</button>
          <button type="button" className="chip" aria-pressed={!!sp.get("sale")} onClick={() => toggleFlag("sale")} data-testid="filter-sale">{c.onSaleOnly}</button>
        </div>
      </fieldset>

      {hasFilters && (
        <button type="button" className="text-sm font-medium text-teal hover:underline" onClick={() => update((p) => ["min", "max", "color", "size", "new", "best", "sale", "avail", "collection"].forEach((k) => p.delete(k)))} data-testid="clear-filters">
          {c.clearFilters}
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <button type="button" onClick={() => setDrawer(true)} className="btn-ghost btn-sm" aria-expanded={drawer} data-testid="filters-open">
          <SlidersHorizontal className="h-4 w-4" aria-hidden />{c.filters}{hasFilters && <span className="h-2 w-2 rounded-full bg-teal" aria-hidden />}
        </button>
        <SortSelect />
      </div>
      <aside className="hidden lg:block" aria-label={c.filters}>{panel}</aside>
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={c.filters}>
          <button type="button" className="absolute inset-0 bg-ink/50" aria-label={m.nav.close} onClick={() => setDrawer(false)} />
          <div className="pop-in absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[2rem] bg-white">
            <div className="flex items-center justify-between border-b border-ink/8 px-5 py-4">
              <h2 className="font-display text-lg font-semibold">{c.filters}</h2>
              <button type="button" onClick={() => setDrawer(false)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-metal" aria-label={m.nav.close}><X className="h-5 w-5" /></button>
            </div>
            <div className="overflow-y-auto px-5 py-5">{panel}</div>
            <div className="border-t border-ink/8 p-4">
              <button type="button" className="btn-ink w-full" onClick={() => setDrawer(false)}>
                {c.applyFilters} ({total === 1 ? c.result1 : fmt(c.results, { count: total })})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PriceRange({ initialMin, initialMax, facets, currency, onApply }: { initialMin: string; initialMax: string; facets: Facets; currency: string; onApply: (min: string, max: string) => void }) {
  const { m } = useI18n();
  const c = m.catalog;
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onApply(min, max); }}>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">{c.priceRange} <span className="font-normal text-mute">({currency})</span></legend>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="pmin">{c.min}</label>
          <input id="pmin" inputMode="numeric" pattern="[0-9]*" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} placeholder={`${c.min} ${facets.priceMin}`} className="field py-2" data-testid="price-min" />
          <span className="text-mute" aria-hidden>–</span>
          <label className="sr-only" htmlFor="pmax">{c.max}</label>
          <input id="pmax" inputMode="numeric" pattern="[0-9]*" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} placeholder={`${c.max} ${facets.priceMax}`} className="field py-2" data-testid="price-max" />
        </div>
        <button className="btn-ghost btn-sm mt-3 w-full" data-testid="price-apply">{m.cart.apply}</button>
      </fieldset>
    </form>
  );
}

export function SortSelect() {
  const { m } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const s = m.catalog.sort;
  const opts = [["relevance", s.relevance], ["price_asc", s.priceAsc], ["price_desc", s.priceDesc], ["newest", s.newest], ["bestselling", s.bestselling], ["rating", s.rating]] as const;
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-mute sm:inline">{m.catalog.sortBy}</span>
      <select
        value={sp.get("sort") ?? "relevance"}
        aria-label={m.catalog.sortBy}
        data-testid="sort-select"
        onChange={(e) => {
          const p = new URLSearchParams(sp.toString());
          e.target.value === "relevance" ? p.delete("sort") : p.set("sort", e.target.value);
          router.replace(`${pathname}${p.toString() ? `?${p}` : ""}`, { scroll: false });
        }}
        className="h-10 rounded-full border border-ink/15 bg-white pr-9 pl-4 text-sm focus:border-teal focus:outline-none"
      >
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
