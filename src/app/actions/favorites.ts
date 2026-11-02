"use server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { assertStore } from "@/lib/request";

export async function toggleFavorite(storeArg: string, productId: string): Promise<{ ok: boolean; favorite?: boolean; needsLogin?: boolean }> {
  const store = assertStore(storeArg);
  const user = await getCurrentUser();
  if (!user) return { ok: false, needsLogin: true };
  const existing = await db.query.favorites.findFirst({
    where: and(eq(s.favorites.userId, user.id), eq(s.favorites.productId, productId)),
  });
  if (existing) {
    await db.delete(s.favorites).where(and(eq(s.favorites.userId, user.id), eq(s.favorites.productId, productId)));
  } else {
    const p = await db.query.products.findFirst({ where: eq(s.products.id, productId), columns: { id: true } });
    if (!p) return { ok: false };
    await db.insert(s.favorites).values({ userId: user.id, productId });
  }
  revalidatePath(`/${store}`, "layout");
  return { ok: true, favorite: !existing };
}
