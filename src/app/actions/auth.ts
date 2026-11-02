"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema as s } from "@/db";
import {
  clientIp, consumeAuthToken, createAuthToken, createSession, destroyAllSessions, destroySession,
  getCurrentUser, hashPassword, isStrongPassword, rateLimit, verifyPassword,
} from "@/lib/auth";
import { mergeGuestCarts } from "@/lib/cart";
import { appUrl, sendEmail } from "@/lib/mailer";
import { assertStore } from "@/lib/request";
import { href, STORES, STORE_COOKIE, storeForLocale, type StoreKey } from "@/lib/stores";
import { getMessages, fmt } from "@/i18n";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string>; values?: Record<string, string>; nonce?: number };

const emailSchema = z.string().trim().toLowerCase().email().max(200);

/** Só aceita redirecionamentos internos para evitar open redirect. */
function safeNext(next: FormDataEntryValue | null, store: StoreKey) {
  const v = typeof next === "string" ? next : "";
  return v.startsWith("/") && !v.startsWith("//") && !v.includes("\\") ? v : href(store, "account");
}

export async function login(storeArg: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const store = assertStore(storeArg);
  const m = getMessages(store).auth;
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const ip = await clientIp();
  if (!rateLimit(`login:${ip}`, 20, 15 * 60_000) || !rateLimit(`login:${email}`, 8, 15 * 60_000)) {
    return { message: m.tooManyAttempts, values: { email } };
  }
  const user = await db.query.users.findFirst({ where: eq(s.users.email, email) });
  const ok = await verifyPassword(password, user?.passwordHash);
  if (!user || !ok) return { message: m.invalidCredentials, values: { email } };

  await mergeGuestCarts(user.id);
  await createSession(user.id);
  // A preferência de país/idioma da conta passa a valer ao entrar
  const preferred = storeForLocale(user.preferredLocale);
  (await cookies()).set(STORE_COOKIE, preferred, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  const next = safeNext(fd.get("next"), store);
  redirect(preferred !== store && next === href(store, "account") ? href(preferred, "account") : next);
}

export async function register(storeArg: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const store = assertStore(storeArg);
  const m = getMessages(store).auth;
  const values = { name: String(fd.get("name") ?? "").trim(), email: String(fd.get("email") ?? "").trim().toLowerCase() };
  const password = String(fd.get("password") ?? "");
  const errors: Record<string, string> = {};
  if (values.name.length < 2) errors.name = m.nameRequired;
  if (!emailSchema.safeParse(values.email).success) errors.email = m.invalidEmail;
  if (!isStrongPassword(password)) errors.password = m.passwordWeak;
  if (password !== String(fd.get("confirm") ?? "")) errors.confirm = m.passwordMismatch;
  if (fd.get("terms") !== "on") errors.terms = m.mustAcceptTerms;
  if (Object.keys(errors).length) return { errors, values };
  if (!rateLimit(`register:${await clientIp()}`, 10, 60 * 60_000)) return { message: getMessages(store).errors.rateLimited, values };

  const exists = await db.query.users.findFirst({ where: eq(s.users.email, values.email), columns: { id: true } });
  if (exists) return { errors: { email: m.emailTaken }, values };

  const { locale, market } = STORES[store];
  const [user] = await db.insert(s.users).values({
    name: values.name.slice(0, 120), email: values.email, passwordHash: await hashPassword(password),
    preferredLocale: locale, preferredMarket: market, newsletter: fd.get("newsletter") === "on",
  }).returning();
  if (user.newsletter) {
    await db.insert(s.newsletterSubscribers).values({ email: user.email, market, locale }).onConflictDoNothing();
  }
  const token = await createAuthToken(user.id, "EMAIL_VERIFICATION");
  await sendEmail("verify", user.email, locale, { name: user.name, url: `${appUrl()}${href(store, "verify")}?token=${token}` });
  await mergeGuestCarts(user.id);
  await createSession(user.id);
  redirect(`${href(store, "account")}?welcome=1`);
}

export async function logout(storeArg: string) {
  const store = assertStore(storeArg);
  await destroySession();
  redirect(href(store));
}

export async function requestPasswordReset(storeArg: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const store = assertStore(storeArg);
  const m = getMessages(store).auth;
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!emailSchema.safeParse(email).success) return { errors: { email: m.invalidEmail }, values: { email } };
  if (rateLimit(`reset:${email}`, 3, 60 * 60_000) && rateLimit(`reset-ip:${await clientIp()}`, 10, 60 * 60_000)) {
    const user = await db.query.users.findFirst({ where: eq(s.users.email, email) });
    if (user) {
      const token = await createAuthToken(user.id, "PASSWORD_RESET");
      const target = storeForLocale(user.preferredLocale);
      await sendEmail("reset", user.email, user.preferredLocale, { name: user.name, url: `${appUrl()}${href(target, "reset")}?token=${token}` });
    }
  }
  // Mesma resposta exista ou não a conta (não revela e-mails cadastrados)
  return { ok: true, message: m.forgotSent };
}

export async function resetPassword(storeArg: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const store = assertStore(storeArg);
  const m = getMessages(store).auth;
  const password = String(fd.get("password") ?? "");
  if (!isStrongPassword(password)) return { errors: { password: m.passwordWeak } };
  if (password !== String(fd.get("confirm") ?? "")) return { errors: { confirm: m.passwordMismatch } };
  const row = await consumeAuthToken(String(fd.get("token") ?? ""), "PASSWORD_RESET");
  if (!row) return { message: m.tokenInvalid };
  await db.update(s.users).set({ passwordHash: await hashPassword(password), emailVerifiedAt: new Date() }).where(eq(s.users.id, row.userId));
  await destroyAllSessions(row.userId);
  redirect(`${href(store, "login")}?reset=1`);
}

export async function resendVerification(storeArg: string): Promise<FormState> {
  const store = assertStore(storeArg);
  const user = await getCurrentUser();
  if (!user || user.emailVerifiedAt) return {};
  if (!rateLimit(`verify:${user.id}`, 3, 60 * 60_000)) return { message: getMessages(store).errors.rateLimited };
  const token = await createAuthToken(user.id, "EMAIL_VERIFICATION");
  await sendEmail("verify", user.email, STORES[store].locale, { name: user.name, url: `${appUrl()}${href(store, "verify")}?token=${token}` });
  return { ok: true, message: fmt(getMessages(store).auth.verificationResent) };
}
