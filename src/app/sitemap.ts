import type { MetadataRoute } from "next";
import { db } from "@/db";
import { appUrl } from "@/lib/mailer";
import { href, STORES, STORE_KEYS, type RouteKey, type StoreKey } from "@/lib/stores";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appUrl();
  const out: MetadataRoute.Sitemap = [];
  const langs = (fn: (k: StoreKey) => string | null) =>
    Object.fromEntries(STORE_KEYS.map((k) => [STORES[k].hreflang, fn(k)]).filter(([, v]) => v).map(([l, v]) => [l, base + v]));

  const statics: (RouteKey | "")[] = ["", "products", "categories", "custom", "about", "contact", "faq", "privacy", "terms", "returns", "shipping"];
  for (const k of STORE_KEYS) {
    for (const r of statics) {
      out.push({ url: base + (r ? href(k, r) : href(k)), alternates: { languages: langs((x) => (r ? href(x, r) : href(x))) } });
    }
  }
  const prods = await db.query.products.findMany({ with: { translations: true, markets: true } });
  for (const p of prods) {
    for (const k of STORE_KEYS) {
      const pm = p.markets.find((x) => x.market === STORES[k].market);
      if (!pm?.active) continue;
      const slugOf = (x: StoreKey) => p.translations.find((t) => t.locale === STORES[x].locale)?.slug;
      out.push({
        url: base + href(k, "product", slugOf(k)!), lastModified: p.updatedAt,
        alternates: { languages: langs((x) => (p.markets.find((mm) => mm.market === STORES[x].market)?.active ? href(x, "product", slugOf(x)!) : null)) },
      });
    }
  }
  return out;
}
