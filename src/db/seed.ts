// Popula o banco com dados de demonstração. Uso: npm run db:seed
// Idempotente: apaga e recria catálogo, configurações e textos (não apaga usuários nem pedidos).
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import * as s from "./schema";
import {
  CATEGORIES, PRODUCTS, COLOR_LABELS, FILAMENT_COLORS, FINISH_OPTIONS, REVIEWS, COLLECTIONS, SHIPPING, CA_TAXES, COUPONS, tr,
} from "./seed-data";
import { PAGES } from "./seed-pages";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});
const db = drizzle(pool, { schema: s });

const LOCALES = [["pt-BR", "pt"], ["en-CA", "en"], ["fr-CA", "fr"]] as const;

async function main() {
  console.log("→ limpando catálogo de demonstração…");
  await db.delete(s.collectionProducts);
  await db.delete(s.collections);
  await db.delete(s.cartItems);
  await db.delete(s.reviews);
  await db.delete(s.favorites);
  await db.delete(s.products);
  await db.delete(s.categories);
  await db.delete(s.storeUnits);
  await db.delete(s.taxRates);
  await db.delete(s.coupons);
  await db.delete(s.pages);
  await db.delete(s.banners);

  console.log("→ categorias");
  const catIds: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const [row] = await db.insert(s.categories).values({ key: c.key, image: c.image, sortOrder: c.sortOrder, featured: c.featured }).returning();
    catIds[c.key] = row.id;
    await db.insert(s.categoryTranslations).values(LOCALES.map(([loc, k]) => ({
      categoryId: row.id, locale: loc, name: c.name[k], slug: c.slug[k], description: c.description[k],
    })));
  }

  console.log("→ produtos");
  const prodIds: Record<string, string> = {};
  let i = 0;
  for (const p of PRODUCTS) {
    i++;
    const ratings = REVIEWS.filter((r) => r.sku === p.sku);
    const avg = ratings.length ? ratings.reduce((a, r) => a + r.rating, 0) / ratings.length : 0;
    const [row] = await db.insert(s.products).values({
      sku: p.sku, categoryId: catIds[p.category], material: p.material,
      widthCm: String(p.dims[0]), heightCm: String(p.dims[1]), depthCm: String(p.dims[2]),
      productionDays: p.productionDays, madeToOrder: !!p.madeToOrder, isNew: !!p.isNew, isFeatured: !!p.featured,
      isCustomizable: !!p.customizable || !!p.text, isSample: true, salesCount: p.salesCount,
      ratingAvg: avg.toFixed(1), ratingCount: ratings.length * 3, colors: p.colors,
      createdAt: new Date(Date.now() - (p.isNew ? 5 : 60 + i * 7) * 86400000),
    }).returning();
    prodIds[p.sku] = row.id;

    await db.insert(s.productTranslations).values(LOCALES.map(([loc, k]) => ({
      productId: row.id, locale: loc, name: p.name[k], slug: p.slug[k], shortDesc: p.short[k], description: p.description[k],
      care: p.care?.[k] ?? null, seoTitle: `${p.name[k]} | Fantaisie 3D`, seoDesc: p.short[k],
    })));

    for (const m of ["BR", "CA"] as const) {
      const cfg = p.markets[m];
      await db.insert(s.productMarkets).values({
        productId: row.id, market: m, active: !!cfg, price: cfg?.price ?? 0, salePrice: cfg?.sale ?? null,
        stock: cfg?.stock ?? 0, allowBackorder: true,
      });
    }

    await db.insert(s.productImages).values(Array.from({ length: p.images }, (_, n) => ({
      productId: row.id, url: `/products/${p.slugBase}-${n + 1}.webp`, sortOrder: n,
      alt: tr({ pt: p.name.pt, en: p.name.en, fr: p.name.fr }),
    })));

    let order = 0;
    const addOption = async (kind: (typeof s.optionKindEnum.enumValues)[number], labels: { pt: string; en: string; fr: string }, values: { code: string; hex?: string; label: { pt: string; en: string; fr: string }; delta?: s.MarketCents; scale?: number }[], extra: Partial<typeof s.productOptions.$inferInsert> = {}) => {
      const [opt] = await db.insert(s.productOptions).values({ productId: row.id, kind, labels: tr(labels), sortOrder: order++, ...extra }).returning();
      if (values.length) {
        await db.insert(s.optionValues).values(values.map((v, idx) => ({
          optionId: opt.id, code: v.code, hex: v.hex ?? null, labels: tr(v.label), priceDelta: v.delta ?? {}, scale: v.scale ? String(v.scale) : null, sortOrder: idx,
        })));
      }
    };
    await addOption("PRIMARY_COLOR", { pt: "Cor principal", en: "Main colour", fr: "Couleur principale" },
      p.colors.map((c) => ({ code: c, hex: FILAMENT_COLORS[c].hex, label: COLOR_LABELS[c] })));
    if (p.secondaryColors) {
      await addOption("SECONDARY_COLOR", { pt: "Cor secundária", en: "Accent colour", fr: "Couleur d’accent" },
        p.secondaryColors.map((c) => ({ code: c, hex: FILAMENT_COLORS[c].hex, label: COLOR_LABELS[c] })));
    }
    if (p.sizes) {
      await addOption("SIZE", { pt: "Tamanho", en: "Size", fr: "Format" },
        p.sizes.map((z) => ({ code: z.code, label: z.label, delta: z.delta, scale: z.scale })));
    }
    if (p.silk) {
      await addOption("FINISH", { pt: "Acabamento", en: "Finish", fr: "Fini" },
        FINISH_OPTIONS.map((f) => ({ code: f.code, label: f.label, delta: f.delta })));
    }
    if (p.text) {
      await addOption("TEXT", { pt: "Nome ou texto", en: "Name or text", fr: "Nom ou texte" }, [],
        { maxLength: p.text.maxLength, textPriceDelta: p.text.delta, required: true });
    }
  }

  console.log("→ avaliações");
  const LOC_FOR: Record<string, "pt-BR" | "en-CA" | "fr-CA"> = { pt: "pt-BR", en: "en-CA", fr: "fr-CA" };
  const altNames: Record<string, string[]> = {
    en: ["Emily R.", "Jason T.", "Priya K.", "Olivia M.", "Noah B.", "Sarah L.", "Ethan W.", "Chloe D.", "Liam G.", "Ava P."],
    fr: ["Élodie B.", "Mathieu G.", "Sophie T.", "Antoine L.", "Camille R.", "Julien D.", "Léa M.", "Olivier P.", "Marie-Ève C.", "Simon F."],
  };
  const revRows: (typeof s.reviews.$inferInsert)[] = [];
  REVIEWS.forEach((r, idx) => {
    for (const [, k] of LOCALES) {
      revRows.push({
        productId: prodIds[r.sku], rating: r.rating, comment: r.text[k], locale: LOC_FOR[k],
        authorName: k === "pt" ? r.author : altNames[k][idx % 10],
        createdAt: new Date(Date.now() - (idx + 3) * 86400000 * 4),
      });
    }
  });
  await db.insert(s.reviews).values(revRows);

  console.log("→ coleções");
  for (const c of COLLECTIONS) {
    const [row] = await db.insert(s.collections).values({ key: c.key, labels: tr(c.labels), seasonal: c.seasonal, image: c.image }).returning();
    await db.insert(s.collectionProducts).values(c.skus.map((sku) => ({ collectionId: row.id, productId: prodIds[sku] })));
  }

  console.log("→ unidades, frete, impostos e cupons");
  for (const m of ["BR", "CA"] as const) {
    const u = SHIPPING[m];
    await db.insert(s.storeUnits).values({
      market: m, name: u.name, originAddress: u.origin, pickupEnabled: true, pickupAddress: u.pickupAddress,
      freeShippingMin: u.freeShippingMin, shippingRules: u.rules, paymentMethods: u.payments,
    });
  }
  await db.insert(s.taxRates).values(CA_TAXES.map((t) => ({ market: "CA" as const, region: t.region, code: t.code, rate: t.rate, labels: tr(t.label) })));
  await db.insert(s.coupons).values(COUPONS.map((c) => ({ ...c })));

  console.log("→ páginas institucionais");
  for (const [loc, list] of Object.entries(PAGES)) {
    await db.insert(s.pages).values(list.map((p) => ({ key: p.key, locale: loc as "pt-BR", title: p.title, body: p.body })));
  }

  console.log("→ usuários de demonstração");
  const demo = [
    { email: "admin@fantaisie3d.dev", name: "Admin Fantaisie", role: "ADMIN" as const, password: "Admin12345" },
    { email: "cliente@fantaisie3d.dev", name: "Cliente Exemplo", role: "CUSTOMER" as const, password: "Cliente12345" },
  ];
  for (const u of demo) {
    const exists = await db.query.users.findFirst({ where: eq(s.users.email, u.email) });
    if (!exists) {
      await db.insert(s.users).values({
        email: u.email, name: u.name, role: u.role, passwordHash: await bcrypt.hash(u.password, 12), emailVerifiedAt: new Date(),
      });
    }
  }

  console.log("→ pedidos de exemplo do cliente demo");
  const cliente = await db.query.users.findFirst({ where: eq(s.users.email, "cliente@fantaisie3d.dev") });
  if (cliente) {
    await db.delete(s.orders).where(eq(s.orders.userId, cliente.id));
    const mk = async (o: { number: string; market: "BR" | "CA"; locale: "pt-BR" | "en-CA" | "fr-CA"; currency: string; status: "PAID"; production: (typeof s.productionStatusEnum.enumValues)[number]; daysAgo: number; skus: [string, number, number, string[]][]; shipping: number; taxLines?: s.TaxLine[]; tracking?: { carrier: string; code: string; url: string } }) => {
      const subtotal = o.skus.reduce((a, [, price, q]) => a + price * q, 0);
      const tax = (o.taxLines ?? []).reduce((a, t) => a + t.amount, 0);
      const [row] = await db.insert(s.orders).values({
        number: o.number, market: o.market, currency: o.currency, locale: o.locale, userId: cliente.id, email: cliente.email,
        customerName: cliente.name, status: o.status, productionStatus: o.production, subtotal, shippingCost: o.shipping,
        taxTotal: tax, taxLines: o.taxLines ?? [], total: subtotal + o.shipping + tax, shippingMethod: o.market === "BR" ? "pac" : "expedited",
        createdAt: new Date(Date.now() - o.daysAgo * 86400000),
      }).returning();
      for (const [sku, price, quantity, labels] of o.skus) {
        const def = PRODUCTS.find((p) => p.sku === sku)!;
        await db.insert(s.orderItems).values({
          orderId: row.id, productId: prodIds[sku], name: o.locale === "pt-BR" ? def.name.pt : o.locale === "en-CA" ? def.name.en : def.name.fr,
          sku, image: `/products/${def.slugBase}-1.webp`, unitPrice: price, quantity, selections: [], selectionLabels: labels,
        });
      }
      if (o.tracking) await db.insert(s.shipments).values({ orderId: row.id, carrier: o.tracking.carrier, trackingCode: o.tracking.code, trackingUrl: o.tracking.url, shippedAt: new Date() });
    };
    await mk({ number: "BR-10231", market: "BR", locale: "pt-BR", currency: "BRL", status: "PAID", production: "SHIPPED", daysAgo: 9, shipping: 2290,
      skus: [["F3D-DEC-001", 8990, 1, ["Turquesa", "P · 14 cm"]], ["F3D-ORG-002", 4490, 2, ["Petróleo"]]],
      tracking: { carrier: "Correios", code: "QB123456789BR", url: "https://rastreamento.correios.com.br/app/index.php" } });
    await mk({ number: "BR-10307", market: "BR", locale: "pt-BR", currency: "BRL", status: "PAID", production: "PRINTING", daysAgo: 1, shipping: 0,
      skus: [["F3D-DEC-003", 18990, 1, ["Grafite"]], ["F3D-COL-001", 10490, 1, ["Branco", "Turquesa", "Padrão · 12 cm"]]] });
    await mk({ number: "CA-20114", market: "CA", locale: "fr-CA", currency: "CAD", status: "PAID", production: "FINISHING", daysAgo: 3, shipping: 1590,
      skus: [["F3D-SUP-001", 2900, 1, ["Graphite"]]],
      taxLines: [{ code: "GST", label: "TPS", rate: 0.05, amount: 225 }, { code: "QST", label: "TVQ", rate: 0.09975, amount: 448 }] });
  }

  console.log("✓ seed concluído");
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
