import "server-only";
import { and, asc, desc, eq, gte, ilike, inArray, isNotNull, lte, or, sql, type SQL } from "drizzle-orm";
import { cache } from "react";
import { db, schema as s } from "@/db";
import { STORES, type StoreKey, type LocaleCode } from "./stores";

export type ProductCardData = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  shortDesc: string;
  image: string | null;
  image2: string | null;
  price: number;
  salePrice: number | null;
  ratingAvg: number;
  ratingCount: number;
  isNew: boolean;
  isBestseller: boolean;
  madeToOrder: boolean;
  customizable: boolean;
  stock: number;
  isSample: boolean;
  categoryKey: string;
};

export const BESTSELLER_MIN = 120;

export type CatalogFilters = {
  category?: string; // slug traduzido
  q?: string;
  min?: number; // em unidades da moeda
  max?: number;
  colors?: string[];
  sizes?: string[];
  isNew?: boolean;
  bestsellers?: boolean;
  onSale?: boolean;
  availability?: "in_stock" | "made_to_order";
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "bestselling" | "rating";
  ids?: string[];
  featured?: boolean;
  limit?: number;
  excludeId?: string;
  categoryKey?: string;
  collection?: string;
};

const effectivePrice = sql<number>`coalesce(${s.productMarkets.salePrice}, ${s.productMarkets.price})`;

/** Normaliza texto para busca sem acento. */
export function normalize(q: string) {
  return q.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export async function listProducts(store: StoreKey, f: CatalogFilters = {}): Promise<ProductCardData[]> {
  const { market, locale } = STORES[store];
  const where: (SQL | undefined)[] = [
    eq(s.productMarkets.market, market),
    eq(s.productMarkets.active, true),
    eq(s.productTranslations.locale, locale),
  ];
  if (f.category) where.push(eq(s.categoryTranslations.slug, f.category));
  if (f.categoryKey) where.push(eq(s.categories.key, f.categoryKey));
  if (f.ids) where.push(inArray(s.products.id, f.ids.length ? f.ids : ["-"]));
  if (f.excludeId) where.push(sql`${s.products.id} <> ${f.excludeId}`);
  if (f.featured) where.push(eq(s.products.isFeatured, true));
  if (f.collection) {
    where.push(sql`exists (select 1 from ${s.collectionProducts} cp join ${s.collections} c on c.id = cp.collection_id
      where cp.product_id = ${s.products.id} and c.key = ${f.collection})`);
  }
  if (f.isNew) where.push(eq(s.products.isNew, true));
  if (f.bestsellers) where.push(gte(s.products.salesCount, BESTSELLER_MIN));
  if (f.onSale) where.push(isNotNull(s.productMarkets.salePrice));
  if (f.min != null && !Number.isNaN(f.min)) where.push(gte(effectivePrice, Math.round(f.min * 100)));
  if (f.max != null && !Number.isNaN(f.max)) where.push(lte(effectivePrice, Math.round(f.max * 100)));
  if (f.availability === "in_stock") where.push(sql`${s.productMarkets.stock} > 0`);
  if (f.availability === "made_to_order") where.push(or(sql`${s.productMarkets.stock} <= 0`, eq(s.products.madeToOrder, true)));
  if (f.colors?.length) {
    where.push(sql`${s.products.colors} ?| ${sql.raw(`array[${f.colors.map((c) => `'${c.replace(/[^a-z]/g, "")}'`).join(",")}]`)}`);
  }
  if (f.sizes?.length) {
    where.push(sql`exists (select 1 from ${s.productOptions} po join ${s.optionValues} ov on ov.option_id = po.id
      where po.product_id = ${s.products.id} and po.kind = 'SIZE' and ov.code in ${f.sizes})`);
  }
  if (f.q) {
    const term = `%${normalize(f.q)}%`;
    where.push(or(
      sql`translate(lower(${s.productTranslations.name}), 'áàâãäéèêëíìîïóòôõöúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn') like ${term}`,
      sql`translate(lower(${s.productTranslations.shortDesc}), 'áàâãäéèêëíìîïóòôõöúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn') like ${term}`,
      sql`translate(lower(${s.categoryTranslations.name}), 'áàâãäéèêëíìîïóòôõöúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn') like ${term}`,
      ilike(s.products.sku, term),
    ));
  }

  const order = (() => {
    switch (f.sort) {
      case "price_asc": return [asc(effectivePrice)];
      case "price_desc": return [desc(effectivePrice)];
      case "newest": return [desc(s.products.createdAt)];
      case "bestselling": return [desc(s.products.salesCount)];
      case "rating": return [desc(s.products.ratingAvg), desc(s.products.ratingCount)];
      default: return [desc(s.products.isFeatured), desc(s.products.salesCount)];
    }
  })();

  const rows = await db
    .select({
      id: s.products.id, sku: s.products.sku, slug: s.productTranslations.slug, name: s.productTranslations.name,
      shortDesc: s.productTranslations.shortDesc, price: s.productMarkets.price, salePrice: s.productMarkets.salePrice,
      ratingAvg: s.products.ratingAvg, ratingCount: s.products.ratingCount, isNew: s.products.isNew,
      salesCount: s.products.salesCount, madeToOrder: s.products.madeToOrder, customizable: s.products.isCustomizable,
      stock: s.productMarkets.stock, isSample: s.products.isSample, categoryKey: s.categories.key,
      images: sql<string[]>`(select array_agg(url order by sort_order) from ${s.productImages} pi where pi.product_id = ${s.products.id})`,
    })
    .from(s.products)
    .innerJoin(s.productMarkets, eq(s.productMarkets.productId, s.products.id))
    .innerJoin(s.productTranslations, eq(s.productTranslations.productId, s.products.id))
    .innerJoin(s.categories, eq(s.categories.id, s.products.categoryId))
    .innerJoin(s.categoryTranslations, and(eq(s.categoryTranslations.categoryId, s.categories.id), eq(s.categoryTranslations.locale, locale)))
    .where(and(...where))
    .orderBy(...order)
    .limit(f.limit ?? 200);

  return rows.map((r) => ({
    id: r.id, sku: r.sku, slug: r.slug, name: r.name, shortDesc: r.shortDesc,
    image: r.images?.[0] ?? null, image2: r.images?.[1] ?? null,
    price: r.price, salePrice: r.salePrice, ratingAvg: Number(r.ratingAvg), ratingCount: r.ratingCount,
    isNew: r.isNew, isBestseller: r.salesCount >= BESTSELLER_MIN, madeToOrder: r.madeToOrder || r.stock <= 0,
    customizable: r.customizable, stock: r.stock, isSample: r.isSample, categoryKey: r.categoryKey,
  }));
}

export const getCategories = cache(async (store: StoreKey) => {
  const { locale, market } = STORES[store];
  return db
    .select({
      id: s.categories.id, key: s.categories.key, image: s.categories.image, featured: s.categories.featured,
      name: s.categoryTranslations.name, slug: s.categoryTranslations.slug, description: s.categoryTranslations.description,
      count: sql<number>`(select count(*)::int from ${s.products} p join ${s.productMarkets} pm on pm.product_id = p.id
        where p.category_id = ${s.categories.id} and pm.market = ${market} and pm.active)`,
    })
    .from(s.categories)
    .innerJoin(s.categoryTranslations, and(eq(s.categoryTranslations.categoryId, s.categories.id), eq(s.categoryTranslations.locale, locale)))
    .orderBy(asc(s.categories.sortOrder));
});

export async function getCategoryBySlug(store: StoreKey, slug: string) {
  const cats = await getCategories(store);
  return cats.find((c) => c.slug === slug) ?? null;
}

/** Faixa de preço e opções disponíveis para os filtros. */
export async function getFacets(store: StoreKey) {
  const { market } = STORES[store];
  const [range] = await db
    .select({
      min: sql<number>`coalesce(min(coalesce(${s.productMarkets.salePrice}, ${s.productMarkets.price})), 0)`,
      max: sql<number>`coalesce(max(coalesce(${s.productMarkets.salePrice}, ${s.productMarkets.price})), 0)`,
    })
    .from(s.productMarkets)
    .where(and(eq(s.productMarkets.market, market), eq(s.productMarkets.active, true)));
  const colorRows = await db.execute<{ color: string }>(sql`
    select distinct jsonb_array_elements_text(p.colors) as color from ${s.products} p
    join ${s.productMarkets} pm on pm.product_id = p.id and pm.market = ${market} and pm.active`);
  const sizeRows = await db.execute<{ code: string; label: string }>(sql`
    select distinct ov.code, ov.sort_order from ${s.optionValues} ov join ${s.productOptions} po on po.id = ov.option_id
    join ${s.productMarkets} pm on pm.product_id = po.product_id and pm.market = ${market} and pm.active
    where po.kind = 'SIZE' order by ov.sort_order`);
  return {
    priceMin: Math.floor(Number(range.min) / 100),
    priceMax: Math.ceil(Number(range.max) / 100),
    colors: colorRows.rows.map((r) => r.color),
    sizes: [...new Set(sizeRows.rows.map((r) => r.code))],
  };
}

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProduct>>>;

export async function getProduct(store: StoreKey, slug: string) {
  const { locale, market } = STORES[store];
  const tr = await db.query.productTranslations.findFirst({
    where: and(eq(s.productTranslations.locale, locale), eq(s.productTranslations.slug, slug)),
  });
  if (!tr) return null;
  const p = await db.query.products.findFirst({
    where: eq(s.products.id, tr.productId),
    with: {
      images: { orderBy: asc(s.productImages.sortOrder) },
      options: { orderBy: asc(s.productOptions.sortOrder), with: { values: { orderBy: asc(s.optionValues.sortOrder) } } },
      markets: true,
      translations: true,
      category: { with: { translations: true } },
    },
  });
  if (!p) return null;
  const pm = p.markets.find((m) => m.market === market);
  const reviews = await db.query.reviews.findMany({
    where: and(eq(s.reviews.productId, p.id), eq(s.reviews.approved, true), eq(s.reviews.locale, locale)),
    orderBy: desc(s.reviews.createdAt),
    limit: 10,
  });
  const catTr = p.category.translations.find((t) => t.locale === locale);
  return {
    id: p.id, sku: p.sku, material: p.material, isSample: p.isSample, videoUrl: p.videoUrl,
    dims: { w: Number(p.widthCm), h: Number(p.heightCm), d: Number(p.depthCm) },
    productionDays: p.productionDays, madeToOrder: p.madeToOrder || (pm?.stock ?? 0) <= 0,
    isNew: p.isNew, isBestseller: p.salesCount >= BESTSELLER_MIN, customizable: p.isCustomizable,
    ratingAvg: Number(p.ratingAvg), ratingCount: p.ratingCount, colors: p.colors,
    name: tr.name, slug: tr.slug, shortDesc: tr.shortDesc, description: tr.description, care: tr.care,
    seoTitle: tr.seoTitle, seoDesc: tr.seoDesc,
    category: { key: p.category.key, name: catTr?.name ?? "", slug: catTr?.slug ?? "" },
    images: p.images.map((i) => ({ url: i.url, alt: (i.alt as Record<string, string> | null)?.[locale] ?? tr.name })),
    available: !!pm?.active,
    price: pm?.price ?? 0,
    salePrice: pm?.salePrice ?? null,
    stock: pm?.stock ?? 0,
    options: p.options.map((o) => ({
      id: o.id, kind: o.kind, required: o.required, label: (o.labels as Record<string, string>)[locale] ?? "",
      maxLength: o.maxLength, textPriceDelta: (o.textPriceDelta as Record<string, number> | null)?.[market] ?? 0,
      values: o.values.map((v) => ({
        code: v.code, hex: v.hex, label: (v.labels as Record<string, string>)[locale] ?? v.code,
        priceDelta: (v.priceDelta as Record<string, number>)[market] ?? 0,
      })),
    })),
    slugs: Object.fromEntries(p.translations.map((t) => [t.locale, t.slug])) as Record<LocaleCode, string>,
    reviews: reviews.map((r) => ({ id: r.id, author: r.authorName, rating: r.rating, comment: r.comment, date: r.createdAt })),
  };
}

export async function getCollections(store: StoreKey) {
  const { locale, market } = STORES[store];
  const cols = await db.query.collections.findMany({
    where: eq(s.collections.active, true),
    with: { products: true },
  });
  const out = [];
  for (const c of cols) {
    const items = await listProducts(store, { ids: c.products.map((p) => p.productId), limit: 8 });
    if (items.length) out.push({ key: c.key, seasonal: c.seasonal, image: c.image, label: (c.labels as Record<string, string>)[locale], items });
  }
  void market;
  return out;
}

export async function getHomeReviews(store: StoreKey, limit = 6) {
  const { locale, market } = STORES[store];
  return db
    .select({
      id: s.reviews.id, author: s.reviews.authorName, rating: s.reviews.rating, comment: s.reviews.comment,
      productName: s.productTranslations.name, productSlug: s.productTranslations.slug,
      image: sql<string>`(select url from ${s.productImages} pi where pi.product_id = ${s.reviews.productId} order by sort_order limit 1)`,
    })
    .from(s.reviews)
    .innerJoin(s.productTranslations, and(eq(s.productTranslations.productId, s.reviews.productId), eq(s.productTranslations.locale, locale)))
    .innerJoin(s.productMarkets, and(eq(s.productMarkets.productId, s.reviews.productId), eq(s.productMarkets.market, market), eq(s.productMarkets.active, true)))
    .where(and(eq(s.reviews.locale, locale), eq(s.reviews.rating, 5)))
    .orderBy(desc(s.reviews.createdAt))
    .limit(limit);
}
