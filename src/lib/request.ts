import "server-only";
import { notFound } from "next/navigation";
import { getMessages } from "@/i18n";
import { isStoreKey, STORES, type StoreKey } from "./stores";

/** Resolve a loja a partir do parâmetro de rota, com 404 para valores inválidos. */
export async function resolveStore(params: Promise<{ store: string }>) {
  const { store } = await params;
  if (!isStoreKey(store)) notFound();
  return { store: store as StoreKey, cfg: STORES[store as StoreKey], m: getMessages(store as StoreKey) };
}

export function assertStore(v: unknown): StoreKey {
  if (!isStoreKey(v)) throw new Error("Loja inválida");
  return v;
}
