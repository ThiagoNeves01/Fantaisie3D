import "server-only";
import { cookies, headers } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import { cache } from "react";
import { db, schema as s } from "@/db";

export const SESSION_COOKIE = "f3d_session";
const SESSION_DAYS = 30;

export const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}
export async function verifyPassword(pw: string, hash: string | null | undefined) {
  if (!hash) {
    await bcrypt.compare(pw, "$2a$12$CwTycUXWue0Thq9StjUM0uJ8m0Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z"); // tempo constante
    return false;
  }
  return bcrypt.compare(pw, hash);
}
export function isStrongPassword(pw: string) {
  return pw.length >= 8 && /[a-zA-Z]/.test(pw) && /\d/.test(pw);
}

export type SessionUser = Pick<
  typeof s.users.$inferSelect,
  "id" | "email" | "name" | "role" | "emailVerifiedAt" | "preferredLocale" | "preferredMarket" | "phone" | "newsletter"
>;

/** Usuário da sessão atual (memoizado por requisição). O token é guardado apenas como hash no banco. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = await db
    .select({
      id: s.users.id, email: s.users.email, name: s.users.name, role: s.users.role,
      emailVerifiedAt: s.users.emailVerifiedAt, preferredLocale: s.users.preferredLocale,
      preferredMarket: s.users.preferredMarket, phone: s.users.phone, newsletter: s.users.newsletter,
    })
    .from(s.sessions)
    .innerJoin(s.users, eq(s.users.id, s.sessions.userId))
    .where(and(eq(s.sessions.tokenHash, sha256(token)), gt(s.sessions.expiresAt, new Date())))
    .limit(1);
  return row[0] ?? null;
});

export async function createSession(userId: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  const ua = (await headers()).get("user-agent")?.slice(0, 250) ?? null;
  await db.insert(s.sessions).values({ tokenHash: sha256(token), userId, expiresAt, userAgent: ua });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(s.sessions).where(eq(s.sessions.tokenHash, sha256(token)));
  jar.delete(SESSION_COOKIE);
}

/** Invalida todas as sessões do usuário (ex.: após redefinir a senha). */
export async function destroyAllSessions(userId: string) {
  await db.delete(s.sessions).where(eq(s.sessions.userId, userId));
}

export async function createAuthToken(userId: string, type: "EMAIL_VERIFICATION" | "PASSWORD_RESET") {
  const token = randomToken();
  const ttl = type === "PASSWORD_RESET" ? 3600_000 : 3 * 86400_000;
  await db.insert(s.authTokens).values({ tokenHash: sha256(token), type, userId, expiresAt: new Date(Date.now() + ttl) });
  return token;
}

export async function consumeAuthToken(token: string, type: "EMAIL_VERIFICATION" | "PASSWORD_RESET") {
  const [row] = await db
    .update(s.authTokens)
    .set({ usedAt: new Date() })
    .where(and(
      eq(s.authTokens.tokenHash, sha256(token)), eq(s.authTokens.type, type),
      isNull(s.authTokens.usedAt), gt(s.authTokens.expiresAt, new Date()),
    ))
    .returning();
  return row ?? null;
}

// ───────── Limite simples de tentativas (memória do processo) ─────────
// Em produção com várias instâncias, troque por Redis/Upstash (ver README).
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  b.count++;
  return b.count <= max;
}
export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() ?? h.get("x-real-ip") ?? "local";
}
