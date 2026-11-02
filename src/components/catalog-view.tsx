import { Suspense } from "react";
import Link from "next/link";
import { getCategories, getFacets, listProducts, type CatalogFilters as F } from "@/lib/catalog";
import { getFavoriteIds } from "@/lib/favorites";
import { href, type StoreKey } from "@/lib/stores";
import { fmt, type Messages } from "@/i18n";
import { ProductCard } from "./product-card";
import { CatalogFilters, SortSelect } from "./catalog-filters";

export type SearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const many = (v: string | string[] | undefined) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const SORTS = ["relevance", "price_asc", "price_desc", "newest", "bestselling", "rating"] as const;

export function parseFilters(sp: SearchParams): F {
  const sort = one(sp.sort);
  const avail = one(sp.avail);
  return {
    q: one(sp.q)?.slice(0, 60),
    min: one(sp.min) ? Number(one(sp.min)) : undefined,
    max: one(sp.max) ? Number(one(sp.max)) : undefined,
    colors: many(sp.color).map((c) => c.replace(/[^a-z]/g, "")).filter(Boolean).slice(0, 10),
    sizes: many(sp.size).filter((z) => /^[A-Z]{1,3}$/.test(z)),
    isNew: !!one(sp.new),
    bestsellers: !!one(sp.best),
    onSale: !!one(sp.sale),
    availability: avail === "in_stock" || avail === "made_to_order" ? avail : undefined,
    sort: SORTS.includes(sort as (typeof SORTS)[number]) ? (sort as F["sort"]) : undefined,
    collection: one(sp.collection)?.replace(/[^a-z-]/g, ""),
  };
}

export async function CatalogView({ store, m, title, description, sp, categorySlug }: {
  store: StoreKey; m: Messages; title: string; description?: string | null; sp: SearchParams; categorySlug?: string;
}) {
  const filters = parseFilters(sp);
  const [items, facets, categories, favorites] = await Promise.all([
    listProducts(store, { ...filters, category: categorySlug }),
    getFacets(store),
    getCategories(store),
    getFavoriteIds(),
  ]);
  const c = m.catalog;
  const isSearch = !!filters.q;

  return (
    <div className="on-light">
      <div className="border-b border-ink/6 bg-metal">
        <div className="container-x py-10 sm:py-14">
          <nav aria-label="breadcrumb" className="mb-3 text-sm text-mute">
            <Link href={href(store)} className="hover:text-ink">{m.nav.home}</Link>
            <span aria-hidden className="mx-2">/</span>
            <span aria-current="page">{title}</span>
          </nav>
          <h1 className="text-3xl font-semibold sm:text-[2.6rem]">{title}</h1>
          {description && <p className="mt-3 max-w-2xl text-mute">{description}</p>}
        </div>
      </div>
      <div className="container-x grid gap-8 py-10 lg:grid-cols-[16.5rem_1fr] lg:gap-12">
        <Suspense>
          <CatalogFilters facets={facets} categories={categories} activeCategory={categorySlug} total={items.length} />
        </Suspense>
        <section aria-label={title}>
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-mute" aria-live="polite" data-testid="results-count">
              {items.length === 1 ? c.result1 : fmt(c.results, { count: items.length })}
            </p>
            <div className="hidden lg:block"><Suspense><SortSelect /></Suspense></div>
          </div>
          {items.length ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3">
              {items.map((p, i) => (
                <li key={p.id}><ProductCard p={p} store={store} m={m} favorite={favorites.has(p.id)} priority={i < 3} /></li>
              ))}
            </ul>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-ink/15 px-6 py-16 text-center" data-testid="empty-state">
              <h2 className="text-xl font-semibold">{isSearch ? fmt(c.searchEmpty, { q: filters.q! }) : c.emptyTitle}</h2>
              <p className="mx-auto mt-2 max-w-md text-mute">{isSearch ? c.searchSuggestion : c.emptyText}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href={href(store, "products")} className="btn-ink">{c.allProducts}</Link>
                <Link href={href(store, "custom")} className="btn-ghost">{m.home.ctaCustom}</Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
