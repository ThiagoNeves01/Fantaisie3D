// Fantaisie 3D: modelo de dados (Drizzle ORM / PostgreSQL)
// Duas operações comerciais independentes (BR e CA): preços, estoque, pedidos e carrinhos nunca se misturam.
// Valores monetários sempre em centavos (inteiros) da moeda do mercado.
import {
  pgTable, pgEnum, text, integer, boolean, timestamp, jsonb, numeric,
  primaryKey, uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date());

export const marketEnum = pgEnum("market", ["BR", "CA"]);
export const localeEnum = pgEnum("locale", ["pt-BR", "en-CA", "fr-CA"]);
export const roleEnum = pgEnum("role", ["CUSTOMER", "STAFF", "ADMIN"]);
export const authTokenTypeEnum = pgEnum("auth_token_type", ["EMAIL_VERIFICATION", "PASSWORD_RESET"]);
export const optionKindEnum = pgEnum("option_kind", ["PRIMARY_COLOR", "SECONDARY_COLOR", "SIZE", "FINISH", "TEXT"]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING_PAYMENT", "PAID", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED",
]);
export const productionStatusEnum = pgEnum("production_status", [
  "RECEIVED", "AWAITING_PRODUCTION", "PRINTING", "FINISHING", "READY_TO_SHIP", "SHIPPED", "DELIVERED",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["PENDING", "AUTHORIZED", "PAID", "FAILED", "REFUNDED"]);
export const couponTypeEnum = pgEnum("coupon_type", ["PERCENT", "FIXED", "FREE_SHIPPING"]);
export const quoteStatusEnum = pgEnum("quote_status", [
  "NEW", "IN_REVIEW", "PROPOSAL_SENT", "ACCEPTED", "DECLINED", "CLOSED",
]);

export type Market = (typeof marketEnum.enumValues)[number];
export type Locale = (typeof localeEnum.enumValues)[number];
/** Textos traduzidos guardados em JSON: { "pt-BR": "...", "en-CA": "...", "fr-CA": "..." } */
export type I18nText = Partial<Record<Locale, string>>;
/** Valores por mercado em centavos: { BR: 1500, CA: 500 } */
export type MarketCents = Partial<Record<Market, number>>;

// ───────────── Usuários e autenticação ─────────────

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash"),
  role: roleEnum("role").default("CUSTOMER").notNull(),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  phone: text("phone"),
  preferredLocale: localeEnum("preferred_locale").default("pt-BR").notNull(),
  preferredMarket: marketEnum("preferred_market").default("BR").notNull(),
  newsletter: boolean("newsletter").default(false).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const sessions = pgTable("sessions", {
  id: id(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  userAgent: text("user_agent"),
  createdAt: createdAt(),
}, (t) => [index("sessions_user_idx").on(t.userId)]);

export const authTokens = pgTable("auth_tokens", {
  id: id(),
  tokenHash: text("token_hash").notNull().unique(),
  type: authTokenTypeEnum("type").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: createdAt(),
});

/** Login social (Google etc.), preparado para quando houver credenciais. */
export const oauthAccounts = pgTable("oauth_accounts", {
  id: id(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
}, (t) => [uniqueIndex("oauth_provider_uq").on(t.provider, t.providerAccountId)]);

export const addresses = pgTable("addresses", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: text("label"),
  recipient: text("recipient").notNull(),
  phone: text("phone"),
  country: marketEnum("country").notNull(),
  postalCode: text("postal_code").notNull(),
  street: text("street").notNull(),
  number: text("number"),
  complement: text("complement"),
  district: text("district"),
  city: text("city").notNull(),
  region: text("region").notNull(), // UF (BR) ou província (CA)
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: createdAt(),
}, (t) => [index("addresses_user_idx").on(t.userId)]);

// ───────────── Catálogo ─────────────

export const categories = pgTable("categories", {
  id: id(),
  key: text("key").notNull().unique(),
  image: text("image"),
  sortOrder: integer("sort_order").default(0).notNull(),
  featured: boolean("featured").default(false).notNull(),
});

export const categoryTranslations = pgTable("category_translations", {
  id: id(),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  locale: localeEnum("locale").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
}, (t) => [
  uniqueIndex("cat_tr_uq").on(t.categoryId, t.locale),
  uniqueIndex("cat_tr_slug_uq").on(t.locale, t.slug),
]);

export const products = pgTable("products", {
  id: id(),
  sku: text("sku").notNull().unique(),
  categoryId: text("category_id").notNull().references(() => categories.id),
  material: text("material").default("PLA").notNull(),
  widthCm: numeric("width_cm", { precision: 6, scale: 1 }).notNull(),
  heightCm: numeric("height_cm", { precision: 6, scale: 1 }).notNull(),
  depthCm: numeric("depth_cm", { precision: 6, scale: 1 }).notNull(),
  productionDays: integer("production_days").default(3).notNull(),
  madeToOrder: boolean("made_to_order").default(false).notNull(),
  isNew: boolean("is_new").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isCustomizable: boolean("is_customizable").default(false).notNull(),
  /** Produto fictício de demonstração: substitua pelos reais no painel. */
  isSample: boolean("is_sample").default(true).notNull(),
  salesCount: integer("sales_count").default(0).notNull(),
  ratingAvg: numeric("rating_avg", { precision: 2, scale: 1 }).default("0").notNull(),
  ratingCount: integer("rating_count").default(0).notNull(),
  colors: jsonb("colors").$type<string[]>().default([]).notNull(), // códigos de cor disponíveis (para filtros)
  videoUrl: text("video_url"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const productTranslations = pgTable("product_translations", {
  id: id(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  locale: localeEnum("locale").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  shortDesc: text("short_desc").notNull(),
  description: text("description").notNull(),
  care: text("care"),
  seoTitle: text("seo_title"),
  seoDesc: text("seo_desc"),
}, (t) => [
  uniqueIndex("prod_tr_uq").on(t.productId, t.locale),
  uniqueIndex("prod_tr_slug_uq").on(t.locale, t.slug),
]);

/** Configuração do produto por operação comercial: visibilidade, preço e estoque. */
export const productMarkets = pgTable("product_markets", {
  id: id(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  market: marketEnum("market").notNull(),
  active: boolean("active").default(true).notNull(),
  price: integer("price").notNull(),
  salePrice: integer("sale_price"),
  stock: integer("stock").default(0).notNull(),
  allowBackorder: boolean("allow_backorder").default(true).notNull(), // produção sob demanda
}, (t) => [
  uniqueIndex("prod_market_uq").on(t.productId, t.market),
  index("prod_market_active_idx").on(t.market, t.active),
]);

export const productImages = pgTable("product_images", {
  id: id(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: jsonb("alt").$type<I18nText>(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const productOptions = pgTable("product_options", {
  id: id(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  kind: optionKindEnum("kind").notNull(),
  required: boolean("required").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  labels: jsonb("labels").$type<I18nText>().notNull(),
  /** Para opções TEXT: acréscimo fixo por mercado quando preenchido. */
  textPriceDelta: jsonb("text_price_delta").$type<MarketCents>(),
  maxLength: integer("max_length"),
});

export const optionValues = pgTable("option_values", {
  id: id(),
  optionId: text("option_id").notNull().references(() => productOptions.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  hex: text("hex"),
  labels: jsonb("labels").$type<I18nText>().notNull(),
  priceDelta: jsonb("price_delta").$type<MarketCents>().default({}).notNull(),
  scale: numeric("scale", { precision: 4, scale: 2 }),
  sortOrder: integer("sort_order").default(0).notNull(),
}, (t) => [uniqueIndex("option_value_uq").on(t.optionId, t.code)]);

export const collections = pgTable("collections", {
  id: id(),
  key: text("key").notNull().unique(),
  labels: jsonb("labels").$type<I18nText>().notNull(),
  seasonal: boolean("seasonal").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  image: text("image"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
});

export const collectionProducts = pgTable("collection_products", {
  collectionId: text("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.collectionId, t.productId] })]);

export const reviews = pgTable("reviews", {
  id: id(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  locale: localeEnum("locale").notNull(),
  approved: boolean("approved").default(true).notNull(),
  createdAt: createdAt(),
});

export const favorites = pgTable("favorites", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
}, (t) => [primaryKey({ columns: [t.userId, t.productId] })]);

export const banners = pgTable("banners", {
  id: id(),
  market: marketEnum("market").notNull(),
  placement: text("placement").default("home_hero").notNull(),
  image: text("image").notNull(),
  labels: jsonb("labels").$type<Record<string, I18nText>>().notNull(),
  href: text("href"),
  active: boolean("active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

// ───────────── Carrinho ─────────────

export type Selection = { optionId: string; kind: string; valueCode?: string; text?: string };

export const carts = pgTable("carts", {
  id: id(),
  tokenHash: text("token_hash").unique(), // carrinho de visitante (cookie)
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  market: marketEnum("market").notNull(),
  couponCode: text("coupon_code"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [index("carts_user_market_idx").on(t.userId, t.market)]);

export const cartItems = pgTable("cart_items", {
  id: id(),
  cartId: text("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  selections: jsonb("selections").$type<Selection[]>().notNull(),
  signature: text("signature").notNull(),
  notes: text("notes"),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("cart_item_uq").on(t.cartId, t.productId, t.signature)]);

// ───────────── Pedidos, pagamentos e entregas ─────────────

export type TaxLine = { code: string; label: string; rate: number; amount: number };

export const orders = pgTable("orders", {
  id: id(),
  number: text("number").notNull().unique(),
  market: marketEnum("market").notNull(),
  currency: text("currency").notNull(), // BRL | CAD
  locale: localeEnum("locale").notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  customerName: text("customer_name").notNull(),
  phone: text("phone"),
  status: orderStatusEnum("status").default("PENDING_PAYMENT").notNull(),
  productionStatus: productionStatusEnum("production_status").default("RECEIVED").notNull(),
  estimatedReadyAt: timestamp("estimated_ready_at", { withTimezone: true }),
  subtotal: integer("subtotal").notNull(),
  discount: integer("discount").default(0).notNull(),
  shippingCost: integer("shipping_cost").default(0).notNull(),
  taxTotal: integer("tax_total").default(0).notNull(),
  total: integer("total").notNull(),
  taxLines: jsonb("tax_lines").$type<TaxLine[]>().default([]).notNull(),
  couponCode: text("coupon_code"),
  shippingAddress: jsonb("shipping_address"),
  shippingMethod: text("shipping_method"),
  pickup: boolean("pickup").default(false).notNull(),
  notes: text("notes"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  index("orders_market_status_idx").on(t.market, t.status),
  index("orders_user_idx").on(t.userId),
]);

export const orderItems = pgTable("order_items", {
  id: id(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  image: text("image"),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  selections: jsonb("selections").$type<Selection[]>().notNull(),
  selectionLabels: jsonb("selection_labels").$type<string[]>().default([]).notNull(),
  notes: text("notes"),
});

export const orderEvents = pgTable("order_events", {
  id: id(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  message: text("message"),
  createdAt: createdAt(),
});

export const payments = pgTable("payments", {
  id: id(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // mercadopago | stripe | manual
  method: text("method").notNull(), // pix | card | apple_pay | google_pay
  status: paymentStatusEnum("status").default("PENDING").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  externalId: text("external_id").unique(),
  raw: jsonb("raw"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const shipments = pgTable("shipments", {
  id: id(),
  orderId: text("order_id").notNull().unique().references(() => orders.id, { onDelete: "cascade" }),
  carrier: text("carrier").notNull(),
  service: text("service"),
  trackingCode: text("tracking_code"),
  trackingUrl: text("tracking_url"),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
});

export type ShippingRule = {
  code: string; // ex.: "pac", "sedex", "expedited"
  carrier: string;
  labels: I18nText;
  baseCents: number;
  perItemCents: number;
  minDays: number;
  maxDays: number;
};

/** Configuração de cada unidade operacional (BR e CA). */
export const storeUnits = pgTable("store_units", {
  id: id(),
  market: marketEnum("market").notNull().unique(),
  name: text("name").notNull(),
  originAddress: jsonb("origin_address").notNull(),
  pickupEnabled: boolean("pickup_enabled").default(true).notNull(),
  pickupAddress: text("pickup_address"),
  freeShippingMin: integer("free_shipping_min"),
  shippingRules: jsonb("shipping_rules").$type<ShippingRule[]>().notNull(),
  paymentMethods: jsonb("payment_methods").$type<string[]>().notNull(),
});

export const taxRates = pgTable("tax_rates", {
  id: id(),
  market: marketEnum("market").notNull(),
  region: text("region").notNull(), // UF / província; "*" = padrão
  code: text("code").notNull(), // GST, QST, HST, PST
  labels: jsonb("labels").$type<I18nText>().notNull(),
  rate: numeric("rate", { precision: 6, scale: 5 }).notNull(),
}, (t) => [uniqueIndex("tax_rate_uq").on(t.market, t.region, t.code)]);

export const coupons = pgTable("coupons", {
  id: id(),
  code: text("code").notNull(),
  market: marketEnum("market").notNull(),
  type: couponTypeEnum("type").notNull(),
  value: integer("value").notNull(), // % ou centavos
  minSubtotal: integer("min_subtotal"),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
}, (t) => [uniqueIndex("coupon_uq").on(t.code, t.market)]);

// ───────────── Orçamentos personalizados ─────────────

export const quoteRequests = pgTable("quote_requests", {
  id: id(),
  number: text("number").notNull().unique(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  market: marketEnum("market").notNull(),
  locale: localeEnum("locale").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  productType: text("product_type").notNull(),
  description: text("description").notNull(),
  dimensions: text("dimensions"),
  colors: text("colors"),
  quantity: integer("quantity").default(1).notNull(),
  desiredDate: timestamp("desired_date", { withTimezone: true }),
  notes: text("notes"),
  status: quoteStatusEnum("status").default("NEW").notNull(),
  proposalAmount: integer("proposal_amount"),
  proposalMessage: text("proposal_message"),
  createdAt: createdAt(),
});

export const quoteFiles = pgTable("quote_files", {
  id: id(),
  quoteId: text("quote_id").notNull().references(() => quoteRequests.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(), // image | model
  filename: text("filename").notNull(),
  path: text("path").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: id(),
  email: text("email").notNull(),
  market: marketEnum("market").notNull(),
  locale: localeEnum("locale").notNull(),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("newsletter_uq").on(t.email, t.market)]);

export const contactMessages = pgTable("contact_messages", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  market: marketEnum("market").notNull(),
  locale: localeEnum("locale").notNull(),
  createdAt: createdAt(),
});

/** Textos institucionais e legais editáveis por idioma/país (markdown simples). */
export const pages = pgTable("pages", {
  id: id(),
  key: text("key").notNull(), // about, faq, privacy, terms, returns, shipping
  locale: localeEnum("locale").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex("pages_uq").on(t.key, t.locale)]);

/** E-mails transacionais enviados (registro e caixa de saída de desenvolvimento). */
export const emailLog = pgTable("email_log", {
  id: id(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  html: text("html").notNull(),
  template: text("template").notNull(),
  locale: localeEnum("locale").notNull(),
  createdAt: createdAt(),
});

// ───────────── Relações ─────────────

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses), orders: many(orders), favorites: many(favorites),
}));
export const categoriesRelations = relations(categories, ({ many }) => ({
  translations: many(categoryTranslations), products: many(products),
}));
export const categoryTranslationsRelations = relations(categoryTranslations, ({ one }) => ({
  category: one(categories, { fields: [categoryTranslations.categoryId], references: [categories.id] }),
}));
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  translations: many(productTranslations),
  markets: many(productMarkets),
  images: many(productImages),
  options: many(productOptions),
  reviews: many(reviews),
}));
export const productTranslationsRelations = relations(productTranslations, ({ one }) => ({
  product: one(products, { fields: [productTranslations.productId], references: [products.id] }),
}));
export const productMarketsRelations = relations(productMarkets, ({ one }) => ({
  product: one(products, { fields: [productMarkets.productId], references: [products.id] }),
}));
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));
export const productOptionsRelations = relations(productOptions, ({ one, many }) => ({
  product: one(products, { fields: [productOptions.productId], references: [products.id] }),
  values: many(optionValues),
}));
export const optionValuesRelations = relations(optionValues, ({ one }) => ({
  option: one(productOptions, { fields: [optionValues.optionId], references: [productOptions.id] }),
}));
export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
}));
export const cartsRelations = relations(carts, ({ many }) => ({ items: many(cartItems) }));
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  payments: many(payments),
  events: many(orderEvents),
  shipment: one(shipments, { fields: [orders.id], references: [shipments.orderId] }),
}));
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));
export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }),
}));
export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));
export const shipmentsRelations = relations(shipments, ({ one }) => ({
  order: one(orders, { fields: [shipments.orderId], references: [orders.id] }),
}));
export const favoritesRelations = relations(favorites, ({ one }) => ({
  product: one(products, { fields: [favorites.productId], references: [products.id] }),
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
}));
export const collectionsRelations = relations(collections, ({ many }) => ({ products: many(collectionProducts) }));
export const collectionProductsRelations = relations(collectionProducts, ({ one }) => ({
  collection: one(collections, { fields: [collectionProducts.collectionId], references: [collections.id] }),
  product: one(products, { fields: [collectionProducts.productId], references: [products.id] }),
}));
export const quoteRequestsRelations = relations(quoteRequests, ({ many }) => ({ files: many(quoteFiles) }));
export const quoteFilesRelations = relations(quoteFiles, ({ one }) => ({
  quote: one(quoteRequests, { fields: [quoteFiles.quoteId], references: [quoteRequests.id] }),
}));
