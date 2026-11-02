// Gera uma prévia estática e navegável do site (para compartilhar sem servidor/banco).
// Uso: com o site rodando (npm run build && npm start), rode:
//   node scripts/preview/build-preview.mjs http://localhost:3000 ./preview-out
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import pg from "pg";
import "dotenv/config";

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const OUT = path.resolve(process.argv[3] ?? "./preview-out");
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

fs.rmSync(OUT, { recursive: true, force: true });
for (const d of ["p", "assets", "products", "images", "brand"]) fs.mkdirSync(path.join(OUT, d), { recursive: true });

// ── Lista de páginas ────────────────────────────────────────────
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const prods = (await db.query(`select pt.locale, pt.slug from product_translations pt
  join product_markets pm on pm.product_id = pt.product_id and pm.active
   and pm.market = case when pt.locale = 'pt-BR' then 'BR'::market else 'CA'::market end
  join products p on p.id = pt.product_id order by p.is_featured desc, p.sales_count desc`)).rows;
const cats = (await db.query(`select locale, slug from category_translations`)).rows;
await db.end();

const STORES = {
  br: { prefix: "/br", locale: "pt-BR", seg: { products: "produtos", product: "produto", category: "categoria", categories: "categorias", custom: "personalizados", about: "sobre", contact: "contato", cart: "carrinho", account: "conta", orders: "pedidos", favorites: "favoritos", login: "entrar", register: "cadastro", faq: "perguntas-frequentes", privacy: "privacidade", terms: "termos", returns: "trocas-e-devolucoes", shipping: "envio" } },
  "ca-en": { prefix: "/ca/en", locale: "en-CA", seg: { products: "products", product: "product", category: "category", categories: "categories", custom: "custom", about: "about", contact: "contact", cart: "cart", account: "account", orders: "orders", favorites: "favorites", login: "sign-in", register: "register", faq: "faq", privacy: "privacy", terms: "terms", returns: "returns", shipping: "shipping" } },
  "ca-fr": { prefix: "/ca/fr", locale: "fr-CA", seg: { products: "produits", product: "produit", category: "categorie", categories: "categories", custom: "sur-mesure", about: "a-propos", contact: "nous-joindre", cart: "panier", account: "compte", orders: "commandes", favorites: "favoris", login: "connexion", register: "inscription", faq: "faq", privacy: "confidentialite", terms: "conditions", returns: "retours", shipping: "livraison" } },
};

const publicPages = [];
const cartPages = [];
const accountPages = [];
for (const [key, st] of Object.entries(STORES)) {
  const s = st.seg;
  const P = (...x) => [st.prefix, ...x].join("/");
  publicPages.push(st.prefix, P(s.products), P(s.categories), P(s.custom), P(s.about), P(s.contact), P(s.faq),
    P(s.privacy), P(s.terms), P(s.returns), P(s.shipping), P(s.login), P(s.register));
  for (const c of cats.filter((c) => c.locale === st.locale)) publicPages.push(P(s.category, c.slug));
  for (const p of prods.filter((p) => p.locale === st.locale)) publicPages.push(P(s.product, p.slug));
  cartPages.push({ key, path: P(s.cart) });
  accountPages.push(P(s.account), P(s.account, s.orders), P(s.account, s.favorites));
}

const nameOf = (p) => p.replace(/^\//, "").replace(/\//g, "-") || "br";
const known = new Set([...publicPages, ...cartPages.map((c) => c.path), ...accountPages]);

// ── Captura ─────────────────────────────────────────────────────
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const page = await ctx.newPage();
const assets = new Map(); // url → arquivo local
const manifest = [];

async function grab(p, group) {
  await page.goto(BASE + p, { waitUntil: "networkidle" });
  const final = new URL(page.url()).pathname;
  const data = await page.evaluate(() => {
    const alts = {};
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((l) => { alts[l.getAttribute("hreflang")] = new URL(l.href).pathname; });
    document.querySelectorAll("script, noscript, next-route-announcer, nextjs-portal").forEach((e) => e.remove());
    document.querySelectorAll('[data-nextjs-toast], [data-next-badge-root]').forEach((e) => e.remove());
    const css = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href);
    return {
      title: document.title, lang: document.documentElement.lang, htmlClass: document.documentElement.className,
      body: document.body.innerHTML, bodyClass: document.body.className, alts, css,
      h1: document.querySelector("h1")?.textContent?.trim() ?? document.title,
    };
  });
  for (const href of data.css) {
    if (!assets.has(href)) {
      let css = await (await fetch(href)).text();
      // fontes: url(/_next/static/media/x.woff2) ou url(../media/x.woff2), relativas ao CSS
      const urls = [...css.matchAll(/url\(([^)]*media\/[^)]+\.woff2)\)/g)].map((m) => m[1]);
      for (const u of new Set(urls)) {
        const file = path.basename(u.split("?")[0]);
        const abs = new URL(u, href).href;
        fs.writeFileSync(path.join(OUT, "assets", file), Buffer.from(await (await fetch(abs)).arrayBuffer()));
        css = css.split(u).join(file);
      }
      const file = `app-${assets.size}.css`;
      fs.writeFileSync(path.join(OUT, "assets", file), css);
      assets.set(href, file);
    }
  }
  manifest.push({ name: nameOf(final), path: final, group, title: data.title, h1: data.h1, lang: data.lang, alts: data.alts, data });
  process.stdout.write(".");
}

for (const p of publicPages) await grab(p, "public");

// Carrinho com itens (cada país tem o seu carrinho)
const addFirst = async (prodPath) => {
  await page.goto(BASE + prodPath, { waitUntil: "networkidle" });
  await page.getByTestId("add-to-cart").click();
  await page.getByTestId("added-toast").waitFor();
};
const cartItems = {
  br: ["/br/produto/vaso-onda", "/br/produto/suporte-duplo-controles"],
  "ca-en": ["/ca/en/product/onda-wave-vase", "/ca/en/product/dual-controller-stand"],
  "ca-fr": ["/ca/fr/produit/vase-onda", "/ca/fr/produit/support-double-manettes"],
};
const postal = { br: "01310-100", "ca-en": "M5V 2T6", "ca-fr": "H2X 1Y4" };
for (const c of cartPages) {
  if (c.key !== "ca-fr") for (const p of cartItems[c.key]) await addFirst(p);
  else await addFirst(cartItems["ca-fr"][0]); // CA compartilha o carrinho entre EN e FR
  await page.goto(`${BASE}${c.path}?postal=${encodeURIComponent(postal[c.key])}`, { waitUntil: "networkidle" });
  await grab(c.path, "cart");
}

// Área do cliente (cliente demo)
await page.goto(BASE + "/br/entrar", { waitUntil: "networkidle" });
await page.getByLabel("E-mail", { exact: true }).fill("cliente@fantaisie3d.dev");
await page.getByLabel("Senha", { exact: true }).fill("Cliente12345");
await page.getByTestId("login-submit").click();
await page.waitForURL(/conta|account|compte/);
for (const p of accountPages) await grab(p, "account");

// ── Reescrita dos links e imagens ──────────────────────────────
const nameSet = new Set(manifest.map((m) => m.name));
const copyAsset = (url) => {
  const clean = decodeURIComponent(url).split("?")[0];
  const m = clean.match(/^\/(products|images|brand)\/([\w.-]+)$/);
  if (!m) return null;
  const dest = path.join(OUT, m[1], m[2]);
  if (!fs.existsSync(dest)) fs.copyFileSync(path.join(root, "public", m[1], m[2]), dest);
  return `../${m[1]}/${m[2]}`;
};

for (const m of manifest) {
  let html = m.data.body;
  // next/image → arquivo original
  html = html.replace(/\s(srcset|sizes)="[^"]*"/g, "");
  html = html.replace(/src="\/_next\/image\?url=([^&"]+)[^"]*"/g, (_, u) => `src="${copyAsset(decodeURIComponent(u)) ?? ""}"`);
  html = html.replace(/src="(\/(?:products|images|brand)\/[^"]+)"/g, (_, u) => `src="${copyAsset(u) ?? u}"`);
  // links internos → páginas capturadas
  html = html.replace(/href="(\/[^"#]*)(#[^"]*)?"/g, (all, p) => {
    const pathOnly = p.split("?")[0].replace(/\/$/, "") || "/br";
    const n = nameOf(pathOnly);
    if (nameSet.has(n)) return `href="${n}.html"`;
    return `href="#" data-off="1"`;
  });
  // alternâncias de idioma (hreflang) → nomes de página
  const alt = {};
  for (const [hl, p] of Object.entries(m.alts)) if (nameSet.has(nameOf(p))) alt[hl] = nameOf(p);
  if (!alt["pt-BR"]) {
    // páginas sem hreflang (conta): mesma posição na outra loja
    const rest = m.path.split("/").slice(m.path.startsWith("/br") ? 2 : 3);
    const segKeys = rest.map((seg) => Object.entries(Object.values(STORES).find((s) => m.path.startsWith(s.prefix)).seg).find(([, v]) => v === seg)?.[0]);
    for (const [, st] of Object.entries(STORES)) {
      const n = nameOf([st.prefix, ...segKeys.map((k, i) => (k ? st.seg[k] : rest[i]))].join("/"));
      alt[st.locale] = nameSet.has(n) ? n : nameOf(st.prefix);
    }
  }
  m.altNames = alt;
  const cssLinks = [...new Set(m.data.css.map((c) => assets.get(c)))].map((f) => `<link rel="stylesheet" href="../assets/${f}">`).join("");
  const doc = `<!DOCTYPE html><html lang="${m.lang}" class="${m.data.htmlClass}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${m.title}</title>${cssLinks}
<link rel="stylesheet" href="../assets/preview.css"></head>
<body class="${m.data.bodyClass}" data-page="${m.name}" data-alts='${JSON.stringify(alt)}'>${html}
<script src="../assets/preview.js"></script></body></html>`;
  fs.writeFileSync(path.join(OUT, "p", `${m.name}.html`), doc);
}

fs.copyFileSync(path.join(here, "preview.js"), path.join(OUT, "assets", "preview.js"));
fs.copyFileSync(path.join(here, "preview.css"), path.join(OUT, "assets", "preview.css"));
fs.copyFileSync(path.join(root, "public/brand/emblem-96.png"), path.join(OUT, "brand", "emblem-96.png"));

const pages = manifest.map((m) => ({ name: m.name, path: m.path, group: m.group, title: m.h1, lang: m.lang, alts: m.altNames }));
const shell = fs.readFileSync(path.join(here, "shell.html"), "utf8").replace("/*PAGES*/[]", JSON.stringify(pages));
fs.writeFileSync(path.join(OUT, "index.html"), shell);
await browser.close();
console.log(`\n✓ ${manifest.length} páginas em ${OUT}`);
