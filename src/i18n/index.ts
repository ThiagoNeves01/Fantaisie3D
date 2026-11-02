import ptBR, { type Messages } from "./pt-BR";
import enCA from "./en-CA";
import frCA from "./fr-CA";
import { STORES, type LocaleCode, type StoreKey } from "@/lib/stores";

export type { Messages };

const DICTS: Record<LocaleCode, Messages> = { "pt-BR": ptBR, "en-CA": enCA, "fr-CA": frCA };

export function getMessages(store: StoreKey): Messages {
  return DICTS[STORES[store].locale];
}
export function messagesForLocale(locale: LocaleCode): Messages {
  return DICTS[locale];
}

/** Interpolação simples: t("Olá, {name}", { name: "Ana" }) */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}
