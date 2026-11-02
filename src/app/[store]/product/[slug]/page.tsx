import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Layers, Package, Ruler, Sparkles, Star } from "lucide-react";
import { resolveStore } from "@/lib/request";
import { getProduct, listProducts } from "@/lib/catalog";
import { getFavoriteIds } from "@/lib/favorites";
import { languageAlternates } from "@/lib/alternates";
import { formatDate } from "@/lib/format";
import { appUrl } from "@/lib/mailer";
import { href, STORES } from "@/lib/stores";
import { fmt } from "@/i18n";
import { ProductGallery } from "@/components/product-gallery";
import { ProductConfigurator } from "@/components/product-configurator";
import { Dimensions } from "@/components/dimensions";
import { FavoriteButton } from "@/components/favorite-button";
import { Badges, Price, Stars } from "@/components/product-bits";
import { ProductRow } from "@/components/product-row";

export async function generateMetadata({ params }: PageProps<"/[store]/product/[slug]">): Promise<Metadata> {
  const { store } = await resolveStore(params);
  const { slug } = await params;
  const p = await getProduct(store, decodeURIComponent(slug));
  if (!p) return {};
  return {
    title: p.name,
    description: p.seoDesc ?? p.shortDesc,
    alternates: await languageAlternates(store, ["product", p.slug]),
    openGraph: { images: p.images[0] ? [{ url: p.images[0].url }] : [] },
  };
}

export default async function ProductPage({ params }: PageProps<"/[store]/product/[slug]">) {
  const { store, m } = await resolveStore(params);
  const { slug } = await params;
  const p = await getProduct(store, decodeURIComponent(slug));
  if (!p) notFound();
  const [related, favorites] = await Promise.all([
    listProducts(store, { categoryKey: p.category.key, excludeId: p.id, limit: 4 }),
    getFavoriteIds(),
  ]);
  const pr = m.product;
  const cfg = STORES[store];
  const stockText = !p.available ? pr.unavailable
    : p.madeToOrder ? pr.madeToOrder
    : p.stock <= 5 ? fmt(pr.lowStock, { count: p.stock }) : pr.inStock;
  const prodMax = p.productionDays + 2;

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, sku: p.sku, description: p.shortDesc,
    image: p.images.map((i) => appUrl() + i.url), brand: { "@type": "Brand", name: "Fantaisie 3D" }, material: p.material,
    ...(p.ratingCount ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.ratingAvg, reviewCount: p.ratingCount } } : {}),
    offers: {
      "@type": "Offer", priceCurrency: cfg.currency, price: ((p.salePrice ?? p.price) / 100).toFixed(2),
      availability: p.available ? (p.madeToOrder ? "https://schema.org/PreOrder" : "https://schema.org/InStock") : "https://schema.org/OutOfStock",
      url: appUrl() + href(store, "product", p.slug),
    },
  };

  return (
    <div className="on-light">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-x pt-6">
        <nav aria-label="breadcrumb" className="text-sm text-mute">
          <Link href={href(store)} className="hover:text-ink">{m.nav.home}</Link><span aria-hidden className="mx-2">/</span>
          <Link href={href(store, "category", p.category.slug)} className="hover:text-ink">{p.category.name}</Link><span aria-hidden className="mx-2">/</span>
          <span aria-current="page" className="text-ink">{p.name}</span>
        </nav>
      </div>

      <div className="container-x grid gap-10 py-8 lg:grid-cols-[1.12fr_1fr] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery images={p.images} videoUrl={p.videoUrl}>
            <div className="pointer-events-none absolute top-4 left-4"><Badges p={p} m={m} /></div>
          </ProductGallery>
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl leading-tight font-semibold sm:text-[2.4rem]" data-testid="product-title">{p.name}</h1>
              <div className="mt-2"><Stars value={p.ratingAvg} count={p.ratingCount} m={m} /></div>
            </div>
          </div>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-ink/80">{p.shortDesc}</p>
          <div className="mt-5" data-testid="product-price">
            <Price store={store} price={p.price} salePrice={p.salePrice} m={m} size="lg" />
            <p className="mt-1 text-xs text-mute">{cfg.market === "BR" ? pr.taxesIncluded : pr.taxesExtra}</p>
          </div>
          {p.isSample && <p className="mt-4 rounded-2xl border border-dashed border-ink/15 px-4 py-2.5 text-xs text-mute">{m.common.sampleNote}</p>}

          <dl className="mt-6 grid gap-3 border-y border-ink/8 py-5 text-sm sm:grid-cols-2">
            <div className="flex gap-3"><Package className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden /><div><dt className="text-mute">{m.catalog.availability}</dt><dd className="font-medium" data-testid="availability">{stockText}</dd></div></div>
            <div className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden /><div><dt className="text-mute">{pr.productionTime}</dt><dd className="font-medium">{fmt(pr.productionDays, { min: p.productionDays, max: prodMax })}</dd></div></div>
            <div className="flex gap-3"><Layers className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden /><div><dt className="text-mute">{pr.material}</dt><dd className="font-medium">{p.material}</dd></div></div>
            <div className="flex gap-3"><Ruler className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden /><div><dt className="text-mute">{pr.dimensions}</dt><dd className="font-medium"><Dimensions {...p.dims} /></dd></div></div>
          </dl>

          <div className="mt-7">
            <ProductConfigurator productId={p.id} price={p.price} salePrice={p.salePrice} options={p.options} available={p.available} />
          </div>
          <div className="mt-3"><FavoriteButton productId={p.id} initial={favorites.has(p.id)} variant="page" /></div>

          <div className="mt-10 space-y-8">
            <section>
              <h2 className="text-lg font-semibold">{pr.description}</h2>
              <p className="mt-2 leading-relaxed text-ink/80">{p.description}</p>
            </section>
            {p.care && (
              <section>
                <h2 className="text-lg font-semibold">{pr.care}</h2>
                <p className="mt-2 leading-relaxed text-ink/80">{p.care}</p>
              </section>
            )}
            <section className="flex gap-4 rounded-[1.75rem] bg-ink p-6 text-metal">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-volt" aria-hidden />
              <div>
                <h2 className="font-semibold text-white">{pr.variationTitle}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-metal/75">{pr.variationText}</p>
              </div>
            </section>
            <p className="text-xs text-mute">{pr.sku}: {p.sku}</p>
          </div>
        </div>
      </div>

      {p.reviews.length > 0 && (
        <section aria-labelledby="reviews" className="container-x mt-12">
          <h2 id="reviews" className="text-2xl font-semibold">{pr.reviewsTitle}</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {p.reviews.map((r) => (
              <li key={r.id} className="rounded-[1.75rem] border border-ink/8 p-6">
                <div className="flex items-center justify-between">
                  <span className="flex" role="img" aria-label={fmt(m.common.rating, { value: r.rating })}>
                    {Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-ink text-ink" : "text-ink/20"}`} aria-hidden />)}
                  </span>
                  <time className="text-xs text-mute" dateTime={new Date(r.date).toISOString()}>{formatDate(r.date, store)}</time>
                </div>
                <p className="mt-3 leading-relaxed">{r.comment}</p>
                <p className="mt-3 text-sm font-medium">{r.author}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ProductRow id="related" title={pr.related} items={related} store={store} m={m} favorites={favorites} />
    </div>
  );
}
