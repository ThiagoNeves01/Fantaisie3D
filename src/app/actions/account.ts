"use server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { getCurrentUser, hashPassword, isStrongPassword, verifyPassword } from "@/lib/auth";
import { assertStore } from "@/lib/request";
import { STORES } from "@/lib/stores";
import { getMessages } from "@/i18n";
import type { FormState } from "./auth";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthorized");
  return user;
}

export async function updateProfile(storeArg: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const store = assertStore(storeArg);
  const user = await requireUser();
  const m = getMessages(store);
  const name = String(fd.get("name") ?? "").trim().slice(0, 120);
  const phone = String(fd.get("phone") ?? "").replace(/[^\d+()\s-]/g, "").slice(0, 30);
  if (name.length < 2) return { errors: { name: m.auth.nameRequired } };
  await db.update(s.users).set({ name, phone: phone || null, newsletter: fd.get("newsletter") === "on" }).where(eq(s.users.id, user.id));
  revalidatePath(`/${store}/account`, "layout");
  return { ok: true, message: m.account.profileSaved };
}

export async function changePassword(storeArg: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const store = assertStore(storeArg);
  const user = await requireUser();
  const m = getMessages(store);
  const row = await db.query.users.findFirst({ where: eq(s.users.id, user.id), columns: { passwordHash: true } });
  if (!(await verifyPassword(String(fd.get("current") ?? ""), row?.passwordHash))) return { errors: { current: m.account.wrongPassword } };
  const pw = String(fd.get("password") ?? "");
  if (!isStrongPassword(pw)) return { errors: { password: m.auth.passwordWeak } };
  await db.update(s.users).set({ passwordHash: await hashPassword(pw) }).where(eq(s.users.id, user.id));
  return { ok: true, message: m.account.passwordChanged };
}

export async function saveAddress(storeArg: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const store = assertStore(storeArg);
  const user = await requireUser();
  const m = getMessages(store);
  const get = (k: string, max = 120) => String(fd.get(k) ?? "").trim().slice(0, max);
  const v = {
    label: get("label", 40), recipient: get("recipient"), postalCode: get("postalCode", 12), street: get("street", 200),
    number: get("number", 20), complement: get("complement"), district: get("district"), city: get("city"), region: get("region", 40),
  };
  const errors: Record<string, string> = {};
  for (const k of ["recipient", "postalCode", "street", "city", "region"] as const) if (!v[k]) errors[k] = m.errors.required;
  if (Object.keys(errors).length) return { errors, values: v };
  const existing = await db.query.addresses.findMany({ where: eq(s.addresses.userId, user.id), columns: { id: true } });
  await db.insert(s.addresses).values({
    userId: user.id, country: STORES[store].market, ...v, label: v.label || null, number: v.number || null,
    complement: v.complement || null, district: v.district || null, isDefault: existing.length === 0,
  });
  revalidatePath(`/${store}/account/addresses`);
  return { ok: true, message: m.account.addressSaved, nonce: Date.now() };
}

export async function deleteAddress(storeArg: string, id: string) {
  const store = assertStore(storeArg);
  const user = await requireUser();
  await db.delete(s.addresses).where(and(eq(s.addresses.id, id), eq(s.addresses.userId, user.id)));
  revalidatePath(`/${store}/account/addresses`);
}

export async function setDefaultAddress(storeArg: string, id: string) {
  const store = assertStore(storeArg);
  const user = await requireUser();
  await db.update(s.addresses).set({ isDefault: false }).where(eq(s.addresses.userId, user.id));
  await db.update(s.addresses).set({ isDefault: true }).where(and(eq(s.addresses.id, id), eq(s.addresses.userId, user.id)));
  revalidatePath(`/${store}/account/addresses`);
}
