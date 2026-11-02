"use client";
import { useActionState, useTransition, useState } from "react";
import { useI18n } from "./i18n-provider";
import { Field, PasswordField } from "./auth-forms";
import { changePassword, deleteAddress, saveAddress, setDefaultAddress, updateProfile } from "@/app/actions/account";
import { resendVerification, type FormState } from "@/app/actions/auth";
import { STORES } from "@/lib/stores";

function Msg({ s }: { s: FormState }) {
  if (!s.message) return null;
  return <p role={s.ok ? "status" : "alert"} className={`rounded-2xl px-4 py-3 text-sm ${s.ok ? "bg-teal/10 text-teal-ink" : "bg-danger/10 text-danger"}`} data-testid="form-message">{s.message}</p>;
}

export function ResendVerification() {
  const { store, m } = useI18n();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="mt-2">
      <button type="button" className="text-sm font-medium text-teal hover:underline" disabled={pending}
        onClick={() => start(async () => { const r = await resendVerification(store); setMsg(r.message ?? null); })}>{m.auth.resendVerification}</button>
      {msg && <p role="status" className="text-xs text-mute">{msg}</p>}
    </div>
  );
}

export function ProfileForm({ name, phone, email, newsletter }: { name: string; phone: string | null; email: string; newsletter: boolean }) {
  const { store, m } = useI18n();
  const [s, action, pending] = useActionState<FormState, FormData>(updateProfile.bind(null, store), {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <Msg s={s} />
      <Field name="name" label={m.auth.name} defaultValue={name} error={s.errors?.name} autoComplete="name" maxLength={120} />
      <Field name="email" label={m.auth.email} defaultValue={email} disabled required={false} />
      <Field name="phone" type="tel" label={m.account.phone} defaultValue={phone ?? ""} autoComplete="tel" required={false} maxLength={30} />
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="newsletter" defaultChecked={newsletter} className="h-5 w-5 accent-[#087F89]" />{m.auth.newsletterOptIn}</label>
      <button className="btn-ink" disabled={pending} data-testid="profile-save">{m.common.save}</button>
    </form>
  );
}

export function PasswordForm() {
  const { store, m } = useI18n();
  const [s, action, pending] = useActionState<FormState, FormData>(changePassword.bind(null, store), {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <Msg s={s} />
      <PasswordField name="current" label={m.account.currentPassword} autoComplete="current-password" error={s.errors?.current} />
      <PasswordField name="password" label={m.account.newPassword} autoComplete="new-password" error={s.errors?.password} hint={m.auth.passwordHint} />
      <button className="btn-ink" disabled={pending}>{m.account.changePassword}</button>
    </form>
  );
}

export function AddressForm() {
  const { store, m } = useI18n();
  const ad = m.address;
  const [s, action, pending] = useActionState<FormState, FormData>(saveAddress.bind(null, store), {});
  const e = s.errors ?? {};
  const v = s.ok ? {} : (s.values ?? {});
  const br = STORES[store].market === "BR";
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-6" noValidate key={s.nonce ?? "f"}>
      <div className="sm:col-span-6"><Msg s={s} /></div>
      <div className="sm:col-span-2"><Field name="label" label={ad.label} required={false} defaultValue={v.label} maxLength={40} /></div>
      <div className="sm:col-span-4"><Field name="recipient" label={ad.recipient} error={e.recipient} defaultValue={v.recipient} autoComplete="name" /></div>
      <div className="sm:col-span-2"><Field name="postalCode" label={ad.postalCode} error={e.postalCode} defaultValue={v.postalCode} autoComplete="postal-code" placeholder={m.cart.postalCodePlaceholder} /></div>
      <div className="sm:col-span-4"><Field name="street" label={ad.street} error={e.street} defaultValue={v.street} autoComplete="address-line1" /></div>
      <div className="sm:col-span-2"><Field name="number" label={ad.number} required={br} defaultValue={v.number} /></div>
      <div className="sm:col-span-4"><Field name="complement" label={ad.complement} required={false} defaultValue={v.complement} autoComplete="address-line2" /></div>
      {br && <div className="sm:col-span-2"><Field name="district" label={ad.district} required={false} defaultValue={v.district} /></div>}
      <div className={br ? "sm:col-span-2" : "sm:col-span-3"}><Field name="city" label={ad.city} error={e.city} defaultValue={v.city} autoComplete="address-level2" /></div>
      <div className={br ? "sm:col-span-2" : "sm:col-span-3"}><Field name="region" label={ad.region} error={e.region} defaultValue={v.region} autoComplete="address-level1" maxLength={40} /></div>
      <div className="sm:col-span-6"><p className="mb-3 text-sm text-mute">{ad.country}: {STORES[store].countryName}</p>
        <button className="btn-ink" disabled={pending} data-testid="address-save">{m.account.addAddress}</button></div>
    </form>
  );
}

export function AddressActions({ id, isDefault }: { id: string; isDefault: boolean }) {
  const { store, m } = useI18n();
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-3 text-sm">
      {!isDefault && <button type="button" disabled={pending} className="text-teal hover:underline" onClick={() => start(() => setDefaultAddress(store, id))}>{m.account.makeDefault}</button>}
      <button type="button" disabled={pending} className="text-mute hover:text-danger" onClick={() => start(() => deleteAddress(store, id))}>{m.common.remove}</button>
    </div>
  );
}
