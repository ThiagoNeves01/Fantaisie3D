// Cálculo de preço com opções. Usado no servidor (fonte da verdade) e no cliente (pré-visualização).
export type PricedOption = {
  id: string;
  kind: string;
  required: boolean;
  label: string;
  maxLength: number | null;
  textPriceDelta: number;
  values: { code: string; hex: string | null; label: string; priceDelta: number }[];
};

export type SelectionInput = { optionId: string; kind: string; valueCode?: string; text?: string };

export function basePrice(price: number, salePrice: number | null) {
  return salePrice ?? price;
}

export function optionsDelta(options: PricedOption[], selections: SelectionInput[]) {
  let delta = 0;
  for (const sel of selections) {
    const opt = options.find((o) => o.id === sel.optionId);
    if (!opt) continue;
    if (opt.kind === "TEXT") {
      if (sel.text?.trim()) delta += opt.textPriceDelta;
    } else {
      const v = opt.values.find((x) => x.code === sel.valueCode);
      if (v) delta += v.priceDelta;
    }
  }
  return delta;
}

export function unitPrice(price: number, salePrice: number | null, options: PricedOption[], selections: SelectionInput[]) {
  return basePrice(price, salePrice) + optionsDelta(options, selections);
}

/** Valida e normaliza seleções; retorna null se inválidas. */
export function validateSelections(options: PricedOption[], raw: SelectionInput[], fillDefaults = false): SelectionInput[] | null {
  const out: SelectionInput[] = [];
  for (const opt of options) {
    const sel = raw.find((r) => r.optionId === opt.id);
    if (opt.kind === "TEXT") {
      const text = (sel?.text ?? "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, opt.maxLength ?? 40);
      if (!text && opt.required) return null;
      if (text) out.push({ optionId: opt.id, kind: opt.kind, text });
    } else {
      const code = sel?.valueCode ?? (opt.values.length === 1 || fillDefaults ? opt.values[0]?.code : undefined);
      if (!code || !opt.values.some((v) => v.code === code)) {
        if (opt.required) return null;
        continue;
      }
      out.push({ optionId: opt.id, kind: opt.kind, valueCode: code });
    }
  }
  return out;
}

export function selectionSignature(selections: SelectionInput[]) {
  return selections
    .map((s) => `${s.optionId}:${s.valueCode ?? ""}:${s.text ?? ""}`)
    .sort()
    .join("|");
}
