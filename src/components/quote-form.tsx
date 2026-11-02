"use client";
import { useActionState, useRef, useState } from "react";
import { Box, ImagePlus } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { Field } from "./auth-forms";
import { requestQuote } from "@/app/actions/forms";
import type { FormState } from "@/app/actions/auth";
import { STORES } from "@/lib/stores";

function FilePicker({ name, label, hint, accept, max, error, icon: Icon }: { name: string; label: string; hint: string; accept: string; max: number; error?: string; icon: typeof Box }) {
  const [files, setFiles] = useState<string[]>([]);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <span className="field-label" id={`${name}-label`}>{label}</span>
      <label className={`flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed bg-white p-4 transition-colors hover:border-teal ${error ? "border-danger" : "border-ink/20"}`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-metal"><Icon className="h-5 w-5 text-teal" aria-hidden /></span>
        <span className="min-w-0 text-sm">
          <span className="block truncate font-medium">{files.length ? files.join(", ") : label}</span>
          <span className="block text-xs text-mute">{hint}</span>
        </span>
        <input ref={ref} type="file" name={name} accept={accept} multiple={max > 1} className="sr-only" aria-labelledby={`${name}-label`} aria-invalid={!!error} data-testid={`file-${name}`}
          onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, max).map((f) => f.name))} />
      </label>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function QuoteForm({ defaults }: { defaults: { name?: string; email?: string } }) {
  const { store, m } = useI18n();
  const c = m.custom;
  const [s, action, pending] = useActionState<FormState, FormData>(requestQuote.bind(null, store), {});
  const e = s.errors ?? {};
  const v = s.values ?? {};
  if (s.ok) {
    return (
      <div role="status" className="rounded-[1.75rem] bg-teal/10 p-8 text-teal-ink" data-testid="quote-success">
        <p className="font-display text-xl font-semibold">{s.message}</p>
        <p className="mt-2 text-sm">{c.notAPurchase}</p>
      </div>
    );
  }
  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2" noValidate>
      {s.message && <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger sm:col-span-2">{s.message}</p>}
      <Field name="name" label={c.name} defaultValue={v.name ?? defaults.name} error={e.name} autoComplete="name" maxLength={120} />
      <Field name="email" type="email" label={c.email} defaultValue={v.email ?? defaults.email} error={e.email} autoComplete="email" maxLength={200} />
      <div>
        <label className="field-label" htmlFor="f-country">{c.country}</label>
        <input id="f-country" className="field bg-metal" value={STORES[store].countryName} readOnly aria-readonly />
      </div>
      <div>
        <label className="field-label" htmlFor="f-productType">{c.productType}</label>
        <select id="f-productType" name="productType" defaultValue={v.productType ?? "decor"} className="field" aria-invalid={!!e.productType}>
          {Object.entries(c.productTypes).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="f-description">{c.description}</label>
        <textarea id="f-description" name="description" rows={5} maxLength={5000} required defaultValue={v.description} placeholder={c.descriptionPlaceholder}
          aria-invalid={!!e.description} aria-describedby={e.description ? "desc-err" : undefined} className="field resize-y" data-testid="quote-description" />
        {e.description && <p id="desc-err" className="field-error">{e.description}</p>}
      </div>
      <Field name="dimensions" label={c.dimensions} required={false} defaultValue={v.dimensions} placeholder={c.dimensionsPlaceholder} maxLength={120} />
      <Field name="colors" label={c.colors} required={false} defaultValue={v.colors} maxLength={200} />
      <Field name="quantity" type="number" label={c.quantity} min={1} max={10000} defaultValue={v.quantity ?? "1"} required={false} />
      <Field name="desiredDate" type="date" label={c.desiredDate} required={false} defaultValue={v.desiredDate} min={new Date().toISOString().slice(0, 10)} />
      <div className="sm:col-span-2 grid gap-5 sm:grid-cols-2">
        <FilePicker name="images" label={c.images} hint={c.imagesHint} accept="image/jpeg,image/png,image/webp" max={5} error={e.images} icon={ImagePlus} />
        <FilePicker name="models" label={c.models} hint={c.modelsHint} accept=".stl,.3mf" max={2} error={e.models} icon={Box} />
      </div>
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="f-notes">{c.notes} <span className="font-normal text-mute">({m.common.optional})</span></label>
        <textarea id="f-notes" name="notes" rows={3} maxLength={2000} defaultValue={v.notes} className="field resize-y" />
      </div>
      <div className="sm:col-span-2">
        <p className="mb-4 text-sm text-mute">{c.notAPurchase}</p>
        <button className="btn-volt h-12 px-8" disabled={pending} data-testid="quote-submit">{pending ? m.common.loading : c.submit}</button>
      </div>
    </form>
  );
}
