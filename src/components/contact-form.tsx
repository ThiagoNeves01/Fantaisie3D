"use client";
import { useActionState } from "react";
import { useI18n } from "./i18n-provider";
import { Field } from "./auth-forms";
import { sendContact } from "@/app/actions/forms";
import type { FormState } from "@/app/actions/auth";

export function ContactForm({ defaults }: { defaults: { name?: string; email?: string } }) {
  const { store, m } = useI18n();
  const c = m.contact;
  const [s, action, pending] = useActionState<FormState, FormData>(sendContact.bind(null, store), {});
  const e = s.errors ?? {};
  const v = s.values ?? {};
  if (s.ok) return <p role="status" className="rounded-[1.75rem] bg-teal/10 p-8 font-medium text-teal-ink" data-testid="contact-success">{s.message}</p>;
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2" noValidate>
      {s.message && <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger sm:col-span-2">{s.message}</p>}
      <Field name="name" label={c.name} defaultValue={v.name ?? defaults.name} error={e.name} autoComplete="name" />
      <Field name="email" type="email" label={c.email} defaultValue={v.email ?? defaults.email} error={e.email} autoComplete="email" />
      <div className="sm:col-span-2"><Field name="subject" label={c.subject} defaultValue={v.subject} error={e.subject} maxLength={160} /></div>
      <div className="sm:col-span-2">
        <label htmlFor="f-message" className="field-label">{c.message}</label>
        <textarea id="f-message" name="message" rows={6} maxLength={5000} required defaultValue={v.message} aria-invalid={!!e.message} className="field resize-y" />
        {e.message && <p className="field-error">{e.message}</p>}
      </div>
      <div className="sm:col-span-2"><button className="btn-ink h-12 px-8" disabled={pending} data-testid="contact-submit">{pending ? m.common.loading : c.send}</button></div>
    </form>
  );
}
