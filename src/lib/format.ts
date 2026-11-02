import { STORES, type StoreKey } from "./stores";

const moneyCache = new Map<string, Intl.NumberFormat>();

/** Formata centavos na moeda e no padrão do idioma da loja. */
export function formatMoney(cents: number, store: StoreKey): string {
  const { locale, currency } = STORES[store];
  const key = locale + currency;
  let f = moneyCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2 });
    moneyCache.set(key, f);
  }
  return f.format(cents / 100).replace(/ /g, " ");
}

export function formatDate(d: Date | string, store: StoreKey, opts: Intl.DateTimeFormatOptions = { dateStyle: "long" }) {
  return new Intl.DateTimeFormat(STORES[store].locale, opts).format(new Date(d));
}

export function formatNumber(n: number, store: StoreKey, digits = 1) {
  return new Intl.NumberFormat(STORES[store].locale, { maximumFractionDigits: digits }).format(n);
}

export function cmToIn(cm: number) {
  return cm / 2.54;
}
