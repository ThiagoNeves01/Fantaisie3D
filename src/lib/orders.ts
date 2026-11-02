import "server-only";
import { desc, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";

export async function getUserOrders(userId: string) {
  return db.query.orders.findMany({
    where: eq(s.orders.userId, userId),
    orderBy: desc(s.orders.createdAt),
    with: { items: true, shipment: true },
  });
}

export const PRODUCTION_STEPS = ["RECEIVED", "AWAITING_PRODUCTION", "PRINTING", "FINISHING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"] as const;
