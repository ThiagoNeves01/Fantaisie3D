"use client";
import { createContext, useContext } from "react";
import type { Messages } from "@/i18n";
import type { StoreKey } from "@/lib/stores";

type Ctx = { store: StoreKey; m: Messages };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ store, messages, children }: { store: StoreKey; messages: Messages; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ store, m: messages }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n fora do I18nProvider");
  return ctx;
}
