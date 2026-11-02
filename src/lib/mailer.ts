import "server-only";
import { db, schema as s } from "@/db";
import { messagesForLocale, fmt } from "@/i18n";
import type { LocaleCode } from "./stores";

/**
 * Envio de e-mails transacionais, sempre no idioma do cliente.
 * Sem provedor configurado, os e-mails ficam registrados na tabela email_log e aparecem
 * na caixa de saída de desenvolvimento (/br/dev-emails). Para produção, defina RESEND_API_KEY
 * (ou adapte sendViaProvider para SMTP/SendGrid).
 */
type Template = "verify" | "reset" | "quote" | "contact";

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#F1F1F3;font-family:Inter,Arial,sans-serif;color:#101113">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
  <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden">
  <tr><td style="background:#101113;padding:24px;text-align:center"><span style="color:#00DCE8;font-weight:700;letter-spacing:.2em">FANTAISIE 3D</span></td></tr>
  <tr><td style="padding:32px"><h1 style="font-size:20px;margin:0 0 16px">${title}</h1>${body}</td></tr>
  </table></td></tr></table></body></html>`;
}
const button = (url: string, label: string) =>
  `<p style="margin:24px 0"><a href="${url}" style="background:#00DCE8;color:#101113;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600">${label}</a></p><p style="font-size:12px;color:#666;word-break:break-all">${url}</p>`;

export async function sendEmail(template: Template, to: string, locale: LocaleCode, vars: { name: string; url?: string; number?: string }) {
  const m = messagesForLocale(locale).email;
  const greet = `<p>${fmt(m.greeting, { name: escapeHtml(vars.name) })}</p>`;
  const sign = `<p style="margin-top:24px">${m.signature}</p>`;
  let subject = "";
  let html = "";
  switch (template) {
    case "verify":
      subject = m.verifySubject;
      html = layout(subject, `${greet}<p>${m.verifyText}</p>${button(vars.url!, m.verifyButton)}<p style="font-size:13px;color:#666">${m.ignore}</p>${sign}`);
      break;
    case "reset":
      subject = m.resetSubject;
      html = layout(subject, `${greet}<p>${m.resetText}</p>${button(vars.url!, m.resetButton)}<p style="font-size:13px;color:#666">${m.ignore}</p>${sign}`);
      break;
    case "quote":
      subject = fmt(m.quoteSubject, { number: vars.number ?? "" });
      html = layout(subject, `${greet}<p>${m.quoteText}</p>${sign}`);
      break;
    case "contact":
      subject = m.contactSubject;
      html = layout(subject, `${greet}<p>${m.contactText}</p>${sign}`);
      break;
  }
  await db.insert(s.emailLog).values({ to, subject, html, template, locale });
  if (process.env.RESEND_API_KEY) await sendViaProvider(to, subject, html);
  else if (process.env.NODE_ENV !== "test") console.info(`[mail] ${to} · ${subject}${vars.url ? " · " + vars.url : ""}`);
}

async function sendViaProvider(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "Fantaisie 3D <no-reply@fantaisie3d.com>", to, subject, html }),
  });
  if (!res.ok) console.error("[mail] falha no provedor", res.status, await res.text());
}

export function escapeHtml(v: string) {
  return v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function appUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
