import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Star } from "lucide-react";
import { resolveStore } from "@/lib/request";
import { getCategories, getCollections, getHomeReviews, listProducts } from "@/lib/catalog";
import { getFavoriteIds } from "@/lib/favorites";
import { languageAlternates } from "@/lib/alternates";
import { href } from "@/lib/stores";
import { fmt } from "@/i18n";
import { ProductRow } from "@/components/product-row";
import { InstagramIcon, SOCIAL } from "@/components/footer";

export async function generateMetadata({ params }: PageProps<"/[store]">): Promise<Metadata> {
  const { store, m } = await resolveStore(params);
  return { title: { absolute: m.meta.defaultTitle }, alternates: await languageAlternates(store, []) };
}

export default async function Home({ params }: PageProps<"/[store]">) {
  const { store, m } = await resolveStore(params);
  const [categories, bestsellers, newest, onSale, collections, reviews, favorites] = await Promise.all([
    getCategories(store),
    listProducts(store, { sort: "bestselling", limit: 4 }),
    listProducts(store, { sort: "newest", limit: 4 }),
    listProducts(store, { onSale: true, limit: 4 }),
    getCollections(store),
    getHomeReviews(store, 3),
    getFavoriteIds(),
  ]);
  const h = m.home;
  const [brand, claim] = h.heroTitle.split(" — ");
  const featured = categories.filter((c) => c.featured);

  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <section className="layer-lines relative isolate overflow-hidden bg-ink text-metal" aria-labelledby="hero-title">
        <div className="absolute inset-0 -z-10">
          <Image src="/images/hero-main.webp" alt="" fill priority sizes="100vw" className="hidden object-cover object-[70%_50%] md:block" />
          <Image src="/images/hero-mobile.webp" alt="" fill priority sizes="100vw" className="object-cover object-bottom md:hidden" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/0 max-md:bg-gradient-to-b max-md:from-ink max-md:via-ink/75 max-md:to-ink/10" />
        </div>
        {/* Órbita: elemento-assinatura inspirado no emblema, desenhado uma vez */}
        <svg className="pointer-events-none absolute inset-0 -z-0 hidden h-full w-full md:block" viewBox="0 0 1440 720" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <ellipse cx="1030" cy="430" rx="430" ry="140" transform="rotate(-9 1030 430)" fill="none" stroke="#00DCE8" strokeWidth="1.6" pathLength={1} className="orbit-path" opacity="0.85" />
          <circle cx="1447" cy="362" r="4" fill="#00DCE8" opacity="0.9" />
        </svg>
        <div className="container-x relative flex min-h-[38rem] flex-col justify-center pt-16 pb-28 md:min-h-[42rem] md:pb-32 lg:min-h-[44rem]">
          <h1 id="hero-title" className="max-w-[16ch] text-white lg:max-w-[19ch]">
            <span className="hero-rise block font-display text-lg font-normal tracking-[0.04em] text-metal/70 sm:text-xl">{brand} —</span>
            <span className="hero-rise-2 mt-3 block text-[2.6rem] leading-[1.04] font-semibold sm:text-6xl lg:text-[4.25rem]">{claim}</span>
          </h1>
          <p className="hero-rise-3 mt-6 max-w-[44ch] text-base leading-relaxed text-metal/80 sm:text-lg">{h.heroSubtitle}</p>
          <div className="hero-rise-3 mt-9 flex flex-wrap gap-3">
            <Link href={href(store, "products")} className="btn-volt h-12 px-7">{h.ctaExplore}</Link>
            <Link href={href(store, "custom")} className="btn-ghost-dark h-12 px-7">{h.ctaCustom}</Link>
          </div>
        </div>
        <ul className="container-x relative grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/8 py-6 text-sm lg:grid-cols-4">
          {h.trust.map((t) => (
            <li key={t.title}>
              <p className="font-medium text-white">{t.title}</p>
              <p className="text-metal/60">{t.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Categorias em destaque: emblemas circulares ──────── */}
      <section aria-labelledby="cats-title" className="container-x mt-20 sm:mt-24">
        <div className="mb-10 max-w-2xl">
          <h2 id="cats-title" className="text-2xl font-semibold sm:text-[2rem]">{h.categoriesTitle}</h2>
          <p className="mt-2 text-mute">{h.categoriesSubtitle}</p>
        </div>
        <ul className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
          {featured.map((c) => (
            <li key={c.key} className="group relative flex flex-col items-center text-center">
              <div className="relative aspect-square w-full max-w-[17rem]">
                <svg viewBox="0 0 200 200" className="absolute -inset-[6%] h-[112%] w-[112%] text-teal/0 transition-colors duration-500 group-hover:text-teal/70 group-focus-within:text-teal/70" aria-hidden>
                  <ellipse cx="100" cy="100" rx="98" ry="34" transform="rotate(-18 100 100)" fill="none" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <div className="absolute inset-0 overflow-hidden rounded-full bg-metal ring-1 ring-ink/5">
                  {c.image && <Image src={c.image} alt="" fill sizes="(min-width:1024px) 17rem, 45vw" className="object-cover transition-transform duration-700 ease-[var(--ease-orbit)] group-hover:scale-[1.06]" />}
                </div>
              </div>
              <h3 className="mt-6 text-lg font-semibold">
                <Link href={href(store, "category", c.slug)} className="after:absolute after:inset-0 after:content-['']">{c.name}</Link>
              </h3>
              <p className="mt-1.5 max-w-[30ch] text-sm leading-relaxed text-mute">{c.description}</p>
              <span className="mt-4 text-sm font-medium text-teal group-hover:underline">{fmt(h.shopCategory, { name: c.name })}</span>
            </li>
          ))}
        </ul>
      </section>

      <ProductRow id="best" title={h.bestsellersTitle} items={bestsellers} store={store} m={m} favorites={favorites} seeAllHref={`${href(store, "products")}?sort=bestselling`} />

      {/* ── Personalizados ───────────────────────────────────── */}
      <section aria-labelledby="custom-title" className="container-x mt-24">
        <div className="layer-lines relative isolate grid overflow-hidden rounded-[2.25rem] bg-ink text-metal md:grid-cols-2">
          <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <h2 id="custom-title" className="text-3xl leading-tight font-semibold text-white sm:text-[2.4rem]">{h.heroSlogan}</h2>
            <p className="mt-4 max-w-[46ch] leading-relaxed text-metal/75">{h.customText}</p>
            <div className="mt-8"><Link href={href(store, "custom")} className="btn-volt h-12 px-7">{h.customCta}</Link></div>
          </div>
          <div className="relative min-h-[18rem]">
            <Image src="/images/banner-custom.webp" alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-transparent to-transparent max-md:bg-gradient-to-b" />
          </div>
        </div>
      </section>

      <ProductRow id="new" title={h.newTitle} items={newest} store={store} m={m} favorites={favorites} seeAllHref={`${href(store, "products")}?sort=newest`} />
      <ProductRow id="sale" title={h.saleTitle} items={onSale} store={store} m={m} favorites={favorites} seeAllHref={`${href(store, "products")}?sale=1`} />

      {/* ── Processo: cinco etapas empilhadas como camadas de impressão ── */}
      <section aria-labelledby="process-title" className="mt-24 bg-ink text-metal">
        <div className="container-x grid gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-24">
          <div>
            <h2 id="process-title" className="text-3xl font-semibold text-white sm:text-[2.4rem]">{h.processTitle}</h2>
            <p className="mt-3 max-w-md text-metal/70">{h.processSubtitle}</p>
            <div className="relative mt-10 aspect-square max-w-sm overflow-hidden rounded-full ring-1 ring-white/10">
              <Image src="/images/process-print.webp" alt="" fill sizes="24rem" className="object-cover" />
            </div>
          </div>
          <ol className="flex flex-col">
            {h.process.map((step, i) => (
              <li key={step.title} className="relative border-b border-white/8 py-5 pl-16 last:border-b-0" style={{ marginLeft: `${i * 0.6}rem` }}>
                <span className="absolute top-5 left-0 flex h-10 w-10 items-center justify-center rounded-full border border-volt/50 font-display text-sm text-volt" aria-hidden>{i + 1}</span>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-1 max-w-[52ch] text-sm leading-relaxed text-metal/70">{step.text}</p>
                <span className="absolute right-0 bottom-0 left-16 h-[3px] rounded-full bg-gradient-to-r from-volt/60 to-transparent" style={{ opacity: 0.25 + i * 0.15 }} aria-hidden />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Coleções ─────────────────────────────────────────── */}
      {collections.length > 0 && (
        <section aria-labelledby="col-title" className="container-x mt-24">
          <h2 id="col-title" className="mb-8 text-2xl font-semibold sm:text-[2rem]">{h.collectionsTitle}</h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {collections.map((c) => (
              <li key={c.key} className="group relative overflow-hidden rounded-[2rem] bg-metal">
                <div className="relative aspect-[4/3]">
                  {c.image && <Image src={c.image} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />}
                </div>
                <div className="flex items-center justify-between gap-3 p-5">
                  <h3 className="font-display text-lg font-semibold">
                    <Link href={`${href(store, "products")}?collection=${c.key}`} className="after:absolute after:inset-0 after:content-['']">{c.label}</Link>
                  </h3>
                  <ul className="flex -space-x-3" aria-hidden>
                    {c.items.slice(0, 3).map((p) => p.image && (
                      <li key={p.id} className="relative h-10 w-10 overflow-hidden rounded-full bg-white ring-2 ring-metal">
                        <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Avaliações ───────────────────────────────────────── */}
      {reviews.length > 0 && (
        <section aria-labelledby="rev-title" className="container-x mt-24">
          <h2 id="rev-title" className="mb-8 text-2xl font-semibold sm:text-[2rem]">{h.reviewsTitle}</h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {reviews.map((r) => (
              <li key={r.id} className="flex flex-col rounded-[2rem] border border-ink/8 p-6">
                <span className="flex" role="img" aria-label={fmt(m.common.rating, { value: r.rating })}>
                  {Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-ink text-ink" : "text-ink/20"}`} aria-hidden />)}
                </span>
                <blockquote className="mt-4 flex-1 font-display text-[1.08rem] leading-relaxed text-ink">“{r.comment}”</blockquote>
                <div className="mt-6 flex items-center gap-3">
                  {r.image && <Image src={r.image} alt="" width={44} height={44} className="h-11 w-11 rounded-full bg-metal object-cover" />}
                  <div className="text-sm">
                    <p className="font-medium">{r.author}</p>
                    <Link href={href(store, "product", r.productSlug)} className="text-mute hover:text-teal">{r.productName}</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Fotos reais / Instagram ──────────────────────────── */}
      <section aria-labelledby="ig-title" className="container-x mt-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="ig-title" className="text-2xl font-semibold sm:text-[2rem]">{h.realPhotosTitle}</h2>
            <p className="mt-2 text-mute">{h.realPhotosText}</p>
          </div>
          <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm"><InstagramIcon className="h-4 w-4" />@fantaisie3d</a>
        </div>
        <ul className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
          {["/products/mini-biblioteca-2.webp", "/products/vaso-onda-2.webp", "/products/robo-bolt-3.webp", "/products/suporte-headphone-2.webp", "/products/escultura-orbita-3.webp", "/products/porta-canetas-twist-2.webp"].map((src) => (
            <li key={src} className="relative aspect-square overflow-hidden rounded-2xl bg-metal">
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram @fantaisie3d">
                <Image src={src} alt="" fill sizes="(min-width:1024px) 16vw, 33vw" className="object-cover transition-transform duration-500 hover:scale-105" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
