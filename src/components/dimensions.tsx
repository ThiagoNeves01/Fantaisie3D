"use client";
import { useState } from "react";
import { useI18n } from "./i18n-provider";
import { fmt } from "@/i18n";
import { formatNumber } from "@/lib/format";

export function Dimensions({ w, h, d }: { w: number; h: number; d: number }) {
  const { store, m } = useI18n();
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const conv = (v: number) => formatNumber(unit === "cm" ? v : v / 2.54, store, 1);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span>{fmt(m.product.dimensionsValue, { w: conv(w), h: conv(h), d: conv(d), unit: unit === "cm" ? m.product.unitCm : m.product.unitIn })}</span>
      <span className="text-xs text-mute">({m.product.widthHeightDepth})</span>
      <span className="inline-flex rounded-full bg-metal p-0.5 text-xs" role="group" aria-label={m.product.dimensions}>
        {(["cm", "in"] as const).map((u) => (
          <button key={u} type="button" aria-pressed={unit === u} onClick={() => setUnit(u)} data-testid={`unit-${u}`}
            className={`rounded-full px-2.5 py-1 ${unit === u ? "bg-ink text-metal" : "text-mute"}`}>
            {u === "cm" ? m.product.unitCm : m.product.unitIn}
          </button>
        ))}
      </span>
    </div>
  );
}
