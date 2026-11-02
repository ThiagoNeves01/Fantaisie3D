"use client";
import { useActionState } from "react";
import { useI18n } from "./i18n-provider";
import { subscribeNewsletter } from "@/app/actions/forms";
import type { FormState } from "@/app/actions/auth";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const { store, m } = useI18n();
  const [state, action, pending] = useActionState<FormState, FormData>(subscribeNewsletter.bind(null, store), {});
  return (
    <form action={action} className="w-full" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`nl-${dark}`}>{m.newsletter.email}</label>
        <input id={`nl-${dark}`} name="email" type="email" required autoComplete="email" placeholder={m.newsletter.email}
          aria-invalid={!!state.errors?.email}
          className={`h-12 flex-1 rounded-full px-5 text-[0.95rem] focus:outline-none focus:ring-2 ${dark ? "border border-white/12 bg-ink text-white placeholder:text-metal/45 focus:ring-volt/40" : "border border-ink/15 bg-white text-ink focus:ring-teal/25"}`} />
        <button className="btn-volt h-12" disabled={pending}>{pending ? m.common.loading : m.newsletter.subscribe}</button>
      </div>
      <p aria-live="polite" className={`mt-2 min-h-5 text-sm ${state.errors?.email ? "text-[#ff8a75]" : dark ? "text-volt" : "text-teal"}`}>
        {state.errors?.email ?? state.message ?? ""}
      </p>
      <p className={`text-xs ${dark ? "text-metal/45" : "text-mute"}`}>{m.newsletter.consent}</p>
    </form>
  );
}
