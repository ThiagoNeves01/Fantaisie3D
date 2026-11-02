"use server";
import { z } from "zod";
import { db, schema as s } from "@/db";
import { getCurrentUser, clientIp, rateLimit } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
import { assertStore } from "@/lib/request";
import { STORES } from "@/lib/stores";
import { saveUpload, validateUpload } from "@/lib/uploads";
import { getMessages, fmt } from "@/i18n";
import type { FormState } from "./auth";

const email = z.string().trim().toLowerCase().email().max(200);

export async function subscribeNewsletter(storeArg: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const store = assertStore(storeArg);
  const m = getMessages(store);
  const e = email.safeParse(fd.get("email"));
  if (!e.success) return { errors: { email: m.auth.invalidEmail } };
  if (!rateLimit(`nl:${await clientIp()}`, 10, 60 * 60_000)) return { message: m.errors.rateLimited };
  const { market, locale } = STORES[store];
  const res = await db.insert(s.newsletterSubscribers).values({ email: e.data, market, locale }).onConflictDoNothing().returning();
  return { ok: true, message: res.length ? m.newsletter.success : m.newsletter.already };
}

export async function sendContact(storeArg: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const store = assertStore(storeArg);
  const m = getMessages(store);
  const v = {
    name: String(fd.get("name") ?? "").trim().slice(0, 120),
    email: String(fd.get("email") ?? "").trim().toLowerCase(),
    subject: String(fd.get("subject") ?? "").trim().slice(0, 160),
    message: String(fd.get("message") ?? "").trim().slice(0, 5000),
  };
  const errors: Record<string, string> = {};
  if (!v.name) errors.name = m.errors.required;
  if (!email.safeParse(v.email).success) errors.email = m.auth.invalidEmail;
  if (!v.subject) errors.subject = m.errors.required;
  if (v.message.length < 5) errors.message = m.errors.required;
  if (Object.keys(errors).length) return { errors, values: v };
  if (!rateLimit(`contact:${await clientIp()}`, 5, 60 * 60_000)) return { message: m.errors.rateLimited, values: v };
  const { market, locale } = STORES[store];
  await db.insert(s.contactMessages).values({ ...v, market, locale });
  await sendEmail("contact", v.email, locale, { name: v.name });
  return { ok: true, message: m.contact.sent };
}

function quoteNumber() {
  const d = new Date();
  return `Q${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export async function requestQuote(storeArg: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const store = assertStore(storeArg);
  const m = getMessages(store);
  const c = m.custom;
  const v = {
    name: String(fd.get("name") ?? "").trim().slice(0, 120),
    email: String(fd.get("email") ?? "").trim().toLowerCase(),
    productType: String(fd.get("productType") ?? "other").slice(0, 40),
    description: String(fd.get("description") ?? "").trim().slice(0, 5000),
    dimensions: String(fd.get("dimensions") ?? "").trim().slice(0, 120),
    colors: String(fd.get("colors") ?? "").trim().slice(0, 200),
    quantity: String(fd.get("quantity") ?? "1"),
    desiredDate: String(fd.get("desiredDate") ?? ""),
    notes: String(fd.get("notes") ?? "").trim().slice(0, 2000),
  };
  const errors: Record<string, string> = {};
  if (!v.name) errors.name = m.errors.required;
  if (!email.safeParse(v.email).success) errors.email = m.auth.invalidEmail;
  if (v.description.length < 20) errors.description = c.errors.descriptionShort;
  if (!(v.productType in c.productTypes)) errors.productType = m.errors.invalid;
  const qty = Math.max(1, Math.min(10000, parseInt(v.quantity, 10) || 1));

  const images = fd.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const models = fd.getAll("models").filter((f): f is File => f instanceof File && f.size > 0);
  if (images.length > 5 || models.length > 2) errors.images = c.errors.tooManyFiles;
  const checked: { file: File; kind: "image" | "model"; ext: string; mime: string }[] = [];
  for (const [list, kind] of [[images, "image"], [models, "model"]] as const) {
    for (const f of list) {
      const r = await validateUpload(f, kind);
      if (!r.ok) errors[kind === "image" ? "images" : "models"] = fmt(r.error === "size" ? c.errors.fileSize : c.errors.fileType, { name: f.name.slice(0, 60) });
      else checked.push({ file: f, kind, ext: r.ext, mime: r.mime });
    }
  }
  if (Object.keys(errors).length) return { errors, values: v };
  if (!rateLimit(`quote:${await clientIp()}`, 5, 60 * 60_000)) return { message: m.errors.rateLimited, values: v };

  const user = await getCurrentUser();
  const { market, locale } = STORES[store];
  const number = quoteNumber();
  const desired = v.desiredDate && !Number.isNaN(Date.parse(v.desiredDate)) ? new Date(v.desiredDate) : null;
  const [q] = await db.insert(s.quoteRequests).values({
    number, userId: user?.id ?? null, market, locale, name: v.name, email: v.email, productType: v.productType,
    description: v.description, dimensions: v.dimensions || null, colors: v.colors || null, quantity: qty,
    desiredDate: desired, notes: v.notes || null,
  }).returning();
  for (const f of checked) {
    const saved = await saveUpload(f.file, `quotes/${q.id}`, f.ext);
    await db.insert(s.quoteFiles).values({ quoteId: q.id, kind: f.kind, filename: f.file.name.slice(0, 200), path: saved, mime: f.mime, size: f.file.size });
  }
  await sendEmail("quote", v.email, locale, { name: v.name, number });
  return { ok: true, message: fmt(c.success, { number }) };
}
