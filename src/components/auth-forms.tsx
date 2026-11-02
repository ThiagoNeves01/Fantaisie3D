"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { login, register, requestPasswordReset, resetPassword, type FormState } from "@/app/actions/auth";
import { href } from "@/lib/stores";

export function Field({ name, label, type = "text", error, defaultValue, autoComplete, hint, required = true, ...rest }: {
  name: string; label: string; type?: string; error?: string; defaultValue?: string; autoComplete?: string; hint?: string; required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <input id={id} name={name} type={type} defaultValue={defaultValue} autoComplete={autoComplete} required={required}
        aria-invalid={!!error} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined} className="field" {...rest} />
      {hint && !error && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${id}-err`} className="field-error">{error}</p>}
    </div>
  );
}

export function PasswordField({ name, label, error, autoComplete, hint }: { name: string; label: string; error?: string; autoComplete: string; hint?: string }) {
  const { m } = useI18n();
  const [show, setShow] = useState(false);
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <div className="relative">
        <input id={id} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} required minLength={8} maxLength={200}
          aria-invalid={!!error} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined} className="field pr-12" />
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? m.auth.hidePassword : m.auth.showPassword} aria-pressed={show}
          className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-mute hover:bg-metal hover:text-ink">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && !error && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${id}-err`} className="field-error">{error}</p>}
    </div>
  );
}

function Message({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={`rounded-2xl px-4 py-3 text-sm ${state.ok ? "bg-teal/10 text-teal-ink" : "bg-danger/10 text-danger"}`} data-testid="form-message">
      {state.message}
    </p>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const { store, m } = useI18n();
  const [state, action, pending] = useActionState<FormState, FormData>(login.bind(null, store), {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <Message state={state} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Field name="email" type="email" label={m.auth.email} autoComplete="email" defaultValue={state.values?.email} maxLength={200} />
      <PasswordField name="password" label={m.auth.password} autoComplete="current-password" />
      <div className="text-right"><Link href={href(store, "forgot")} className="text-sm text-teal hover:underline">{m.auth.forgot}</Link></div>
      <button className="btn-ink h-12 w-full" disabled={pending} data-testid="login-submit">{pending ? m.common.loading : m.auth.submitLogin}</button>
    </form>
  );
}

export function RegisterForm() {
  const { store, m } = useI18n();
  const a = m.auth;
  const [state, action, pending] = useActionState<FormState, FormData>(register.bind(null, store), {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <Message state={state} />
      <Field name="name" label={a.name} autoComplete="name" error={e.name} defaultValue={state.values?.name} maxLength={120} />
      <Field name="email" type="email" label={a.email} autoComplete="email" error={e.email} defaultValue={state.values?.email} maxLength={200} />
      <PasswordField name="password" label={a.password} autoComplete="new-password" error={e.password} hint={a.passwordHint} />
      <PasswordField name="confirm" label={a.confirmPassword} autoComplete="new-password" error={e.confirm} />
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="newsletter" className="mt-0.5 h-5 w-5 accent-[#087F89]" />{a.newsletterOptIn}
      </label>
      <div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="terms" className="mt-0.5 h-5 w-5 accent-[#087F89]" aria-invalid={!!e.terms} data-testid="terms" />
          <span>{a.acceptTerms} (<Link href={href(store, "terms")} className="link" target="_blank">{m.footer.terms}</Link>, <Link href={href(store, "privacy")} className="link" target="_blank">{m.footer.privacy}</Link>)</span>
        </label>
        {e.terms && <p className="field-error">{e.terms}</p>}
      </div>
      <button className="btn-ink h-12 w-full" disabled={pending} data-testid="register-submit">{pending ? m.common.loading : a.submitRegister}</button>
    </form>
  );
}

export function ForgotForm() {
  const { store, m } = useI18n();
  const [state, action, pending] = useActionState<FormState, FormData>(requestPasswordReset.bind(null, store), {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <Message state={state} />
      <Field name="email" type="email" label={m.auth.email} autoComplete="email" error={state.errors?.email} defaultValue={state.values?.email} />
      <button className="btn-ink h-12 w-full" disabled={pending} data-testid="forgot-submit">{pending ? m.common.loading : m.auth.forgotSubmit}</button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const { store, m } = useI18n();
  const [state, action, pending] = useActionState<FormState, FormData>(resetPassword.bind(null, store), {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <Message state={state} />
      <input type="hidden" name="token" value={token} />
      <PasswordField name="password" label={m.account.newPassword} autoComplete="new-password" error={state.errors?.password} hint={m.auth.passwordHint} />
      <PasswordField name="confirm" label={m.auth.confirmPassword} autoComplete="new-password" error={state.errors?.confirm} />
      <button className="btn-ink h-12 w-full" disabled={pending} data-testid="reset-submit">{pending ? m.common.loading : m.auth.resetSubmit}</button>
    </form>
  );
}
