import "server-only";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { getCurrentUser } from "./auth";

export async function getFavoriteIds(): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user) return new Set();
  const rows = await db.select({ id: s.favorites.productId }).from(s.favorites).where(eq(s.favorites.userId, user.id));
  return new Set(rows.map((r) => r.id));
}
