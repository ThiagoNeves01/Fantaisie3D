"use server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { alternatesForPublicPath } from "@/lib/alternates";
import { STORES, STORE_COOKIE, isStoreKey, type StoreKey } from "@/lib/stores";

/**
 * Troca de país/idioma: salva a preferência (cookie de 1 ano + conta do cliente)
 * e devolve a URL equivalente da página atual na nova loja.
 */
export async function switchStore(target: string, currentPath: string): Promise<string> {
  if (!isStoreKey(target)) throw new Error("invalid store");
  const store = target as StoreKey;
  (await cookies()).set(STORE_COOKIE, store, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  const user = await getCurrentUser();
  if (user) {
    await db.update(s.users)
      .set({ preferredLocale: STORES[store].locale, preferredMarket: STORES[store].market })
      .where(eq(s.users.id, user.id));
  }
  const safePath = currentPath.startsWith("/") && !currentPath.startsWith("//") ? currentPath.split("?")[0] : "/";
  const alts = await alternatesForPublicPath(safePath);
  return alts?.[store] ?? STORES[store].prefix;
}
