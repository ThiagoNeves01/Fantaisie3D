import "server-only";
import { and, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { href, STORES, STORE_KEYS, parsePublicPath, toInternalSegments, type StoreKey } from "./stores";
import { appUrl } from "./mailer";

/**
 * Para um caminho interno (ex.: ["product", "vaso-onda"]) da loja `from`, devolve o caminho equivalente
 * em cada loja, traduzindo segmentos de rota e slugs de produto/categoria.
 */
export async function alternatesFor(from: StoreKey, internal: string[]): Promise<Record<StoreKey, string>> {
  const out = {} as Record<StoreKey, string>;
  const [first, second, ...rest] = internal;
  if ((first === "product" || first === "category") && second) {
    const fromLocale = STORES[from].locale;
    const table = first === "product" ? s.productTranslations : s.categoryTranslations;
    const idCol = first === "product" ? s.productTranslations.productId : s.categoryTranslations.categoryId;
    const row = await db.select({ id: idCol }).from(table).where(and(eq(table.locale, fromLocale), eq(table.slug, second))).limit(1);
    const all = row[0] ? await db.select({ locale: table.locale, slug: table.slug }).from(table).where(eq(idCol, row[0].id)) : [];
    for (const k of STORE_KEYS) {
      const slug = all.find((a) => a.locale === STORES[k].locale)?.slug;
      out[k] = slug ? href(k, first, slug, ...rest) : href(k, "products");
    }
    return out;
  }
  // href() traduz automaticamente as chaves de rota conhecidas
  for (const k of STORE_KEYS) out[k] = href(k, ...internal);
  return out;
}

/** Converte um caminho público em alternativas (usado pelo seletor de país/idioma). */
export async function alternatesForPublicPath(pathname: string) {
  const parsed = parsePublicPath(pathname);
  if (!parsed) return null;
  const internal = toInternalSegments(parsed.store, parsed.rest) ?? parsed.rest;
  return alternatesFor(parsed.store, internal);
}

/** Metadados hreflang para generateMetadata. */
export async function languageAlternates(from: StoreKey, internal: string[]) {
  const alts = await alternatesFor(from, internal);
  const base = appUrl();
  const languages: Record<string, string> = {};
  for (const k of STORE_KEYS) languages[STORES[k].hreflang] = base + alts[k];
  languages["x-default"] = base + alts.br;
  return { canonical: base + alts[from], languages };
}
