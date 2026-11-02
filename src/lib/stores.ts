// Configuração das "lojas" (país + idioma). Arquivo compartilhado por servidor, cliente e proxy.
export type StoreKey = "br" | "ca-en" | "ca-fr";
export type MarketCode = "BR" | "CA";
export type LocaleCode = "pt-BR" | "en-CA" | "fr-CA";

export type StoreConfig = {
  key: StoreKey;
  market: MarketCode;
  locale: LocaleCode;
  currency: "BRL" | "CAD";
  currencyLabel: string;
  prefix: string; // prefixo público da URL
  hreflang: string;
  countryName: string;
  languageName: string;
  logo: string;
};

export const STORES: Record<StoreKey, StoreConfig> = {
  br: {
    key: "br", market: "BR", locale: "pt-BR", currency: "BRL", currencyLabel: "BRL / R$",
    prefix: "/br", hreflang: "pt-BR", countryName: "Brasil", languageName: "Português", logo: "/brand/logo-pt.png",
  },
  "ca-en": {
    key: "ca-en", market: "CA", locale: "en-CA", currency: "CAD", currencyLabel: "CAD / CA$",
    prefix: "/ca/en", hreflang: "en-CA", countryName: "Canada", languageName: "English", logo: "/brand/logo-en.png",
  },
  "ca-fr": {
    key: "ca-fr", market: "CA", locale: "fr-CA", currency: "CAD", currencyLabel: "CAD / CA$",
    prefix: "/ca/fr", hreflang: "fr-CA", countryName: "Canada", languageName: "Français", logo: "/brand/logo-fr.png",
  },
};

export const STORE_KEYS = Object.keys(STORES) as StoreKey[];
export const DEFAULT_STORE: StoreKey = "br";
export const STORE_COOKIE = "f3d_store";

export function isStoreKey(v: unknown): v is StoreKey {
  return typeof v === "string" && v in STORES;
}

export function storeForLocale(locale: LocaleCode): StoreKey {
  return locale === "pt-BR" ? "br" : locale === "en-CA" ? "ca-en" : "ca-fr";
}

// ───────── Rotas com segmentos traduzidos ─────────
// Chave interna (nome da pasta em app/[store]/...) → segmento público por loja.
export const ROUTE_SEGMENTS = {
  products: { br: "produtos", "ca-en": "products", "ca-fr": "produits" },
  product: { br: "produto", "ca-en": "product", "ca-fr": "produit" },
  category: { br: "categoria", "ca-en": "category", "ca-fr": "categorie" },
  categories: { br: "categorias", "ca-en": "categories", "ca-fr": "categories" },
  custom: { br: "personalizados", "ca-en": "custom", "ca-fr": "sur-mesure" },
  about: { br: "sobre", "ca-en": "about", "ca-fr": "a-propos" },
  contact: { br: "contato", "ca-en": "contact", "ca-fr": "nous-joindre" },
  cart: { br: "carrinho", "ca-en": "cart", "ca-fr": "panier" },
  account: { br: "conta", "ca-en": "account", "ca-fr": "compte" },
  orders: { br: "pedidos", "ca-en": "orders", "ca-fr": "commandes" },
  addresses: { br: "enderecos", "ca-en": "addresses", "ca-fr": "adresses" },
  quotes: { br: "orcamentos", "ca-en": "quotes", "ca-fr": "soumissions" },
  profile: { br: "dados", "ca-en": "profile", "ca-fr": "profil" },
  favorites: { br: "favoritos", "ca-en": "favorites", "ca-fr": "favoris" },
  login: { br: "entrar", "ca-en": "sign-in", "ca-fr": "connexion" },
  register: { br: "cadastro", "ca-en": "register", "ca-fr": "inscription" },
  forgot: { br: "recuperar-senha", "ca-en": "forgot-password", "ca-fr": "mot-de-passe-oublie" },
  reset: { br: "redefinir-senha", "ca-en": "reset-password", "ca-fr": "reinitialiser-mot-de-passe" },
  verify: { br: "confirmar-email", "ca-en": "verify-email", "ca-fr": "confirmer-courriel" },
  search: { br: "busca", "ca-en": "search", "ca-fr": "recherche" },
  faq: { br: "perguntas-frequentes", "ca-en": "faq", "ca-fr": "faq" },
  privacy: { br: "privacidade", "ca-en": "privacy", "ca-fr": "confidentialite" },
  terms: { br: "termos", "ca-en": "terms", "ca-fr": "conditions" },
  returns: { br: "trocas-e-devolucoes", "ca-en": "returns", "ca-fr": "retours" },
  shipping: { br: "envio", "ca-en": "shipping", "ca-fr": "livraison" },
  outbox: { br: "dev-emails", "ca-en": "dev-emails", "ca-fr": "dev-emails" },
} as const satisfies Record<string, Record<StoreKey, string>>;

export type RouteKey = keyof typeof ROUTE_SEGMENTS;

/** Segmento público → chave interna, por loja. */
const REVERSE: Record<StoreKey, Record<string, RouteKey>> = { br: {}, "ca-en": {}, "ca-fr": {} };
for (const [key, map] of Object.entries(ROUTE_SEGMENTS) as [RouteKey, Record<StoreKey, string>][]) {
  for (const s of STORE_KEYS) REVERSE[s][map[s]] = key;
}

/** Converte segmentos públicos em internos (ex.: ["produtos","vaso"] → ["products","vaso"]). */
export function toInternalSegments(store: StoreKey, segs: string[]): string[] | null {
  return segs.map((seg, i) => {
    const key = REVERSE[store][seg];
    // somente segmentos de rota (não slugs) são traduzidos; slugs ficam como estão
    if (key) return key;
    if (i === 0) return seg; // segmento desconhecido → 404 pelo Next
    return seg;
  });
}

/** Gera a URL pública. path usa chaves internas: href("br", "product", "vaso-onda") → /br/produto/vaso-onda */
export function href(store: StoreKey, ...parts: (string | undefined | null)[]): string {
  const segs = parts.filter(Boolean).map((p) => {
    const k = p as RouteKey;
    return k in ROUTE_SEGMENTS ? ROUTE_SEGMENTS[k][store] : encodeURIComponent(p as string);
  });
  return STORES[store].prefix + (segs.length ? "/" + segs.join("/") : "");
}

/** Converte um caminho público completo em {store, internal}. */
export function parsePublicPath(pathname: string): { store: StoreKey; rest: string[] } | null {
  const segs = pathname.split("/").filter(Boolean);
  if (segs[0] === "br") return { store: "br", rest: segs.slice(1) };
  if (segs[0] === "ca" && (segs[1] === "en" || segs[1] === "fr")) {
    return { store: segs[1] === "en" ? "ca-en" : "ca-fr", rest: segs.slice(2) };
  }
  return null;
}
