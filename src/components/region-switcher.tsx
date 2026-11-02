"use client";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { Flag } from "./flags";
import { useI18n } from "./i18n-provider";
import { STORES, STORE_KEYS, type StoreKey } from "@/lib/stores";
import { switchStore } from "@/app/actions/region";
import { fmt } from "@/i18n";

/**
 * Seletor de país/idioma. Desktop: abre ao passar o mouse (e por clique/teclado).
 * Toque: abre ao tocar na bandeira. Mantém a página atual quando existe versão equivalente.
 */
export function RegionSwitcher({ variant = "header" }: { variant?: "header" | "menu" }) {
  const { store, m } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();
  const current = STORES[store];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const choose = (key: StoreKey) => {
    setOpen(false);
    if (key === store) return;
    start(async () => {
      const url = await switchStore(key, pathname + window.location.search);
      // navegação completa: atualiza idioma do <html>, moeda, catálogo e carrinho do país
      window.location.assign(url);
    });
  };

  const hoverable = variant === "header";
  const onEnter = (e: React.PointerEvent) => {
    if (!hoverable || e.pointerType !== "mouse") return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const onLeave = (e: React.PointerEvent) => {
    if (!hoverable || e.pointerType !== "mouse") return;
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  const onMenuKey = (e: React.KeyboardEvent) => {
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>("[role=menuitemradio]") ?? []);
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
  };

  return (
    <div ref={rootRef} className="relative" onPointerEnter={onEnter} onPointerLeave={onLeave}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${m.region.label}: ${current.countryName}, ${current.languageName}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setTimeout(() => rootRef.current?.querySelector<HTMLButtonElement>("[role=menuitemradio]")?.focus(), 0); } }}
        className={
          variant === "header"
            ? "flex h-10 items-center gap-1.5 rounded-full px-2.5 text-metal/85 transition-colors hover:bg-white/8 hover:text-white"
            : "flex w-full items-center gap-3 rounded-2xl border border-white/12 px-4 py-3 text-left text-metal"
        }
        data-testid="region-switcher"
      >
        <Flag market={current.market} className="h-[15px] w-[22px] rounded-[3px] shadow-[0_0_0_1px_rgb(255_255_255/0.15)]" />
        {variant === "header" ? (
          <span className="text-xs font-semibold tracking-wide">{current.key === "br" ? "PT" : current.key === "ca-en" ? "EN" : "FR"}</span>
        ) : (
          <span className="flex-1 text-sm">{current.countryName} — {current.languageName} ({current.currencyLabel})</span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        {pending && <span className="sr-only">{m.common.loading}</span>}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={m.region.label}
          onKeyDown={onMenuKey}
          className={`pop-in absolute z-50 mt-2 w-[19rem] overflow-hidden rounded-3xl border border-white/10 bg-graphite p-2 text-metal shadow-[0_24px_60px_-20px_rgb(0_0_0/0.7)] ${variant === "header" ? "right-0" : "left-0 right-0 w-auto"}`}
        >
          <p className="px-3 pt-2 pb-2 text-xs text-mute-dark">{fmt(m.region.current, { country: current.countryName, language: current.languageName })}</p>
          {STORE_KEYS.map((k) => {
            const cfg = STORES[k];
            const active = k === store;
            return (
              <button
                key={k}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                lang={cfg.hreflang}
                onClick={() => choose(k)}
                data-testid={`region-${k}`}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-white/6 focus-visible:bg-white/6"
              >
                <Flag market={cfg.market} className="h-[18px] w-[26px] shrink-0 rounded-[3px]" />
                <span className="flex-1">
                  <span className="block text-sm font-medium text-white">{cfg.countryName} — {cfg.languageName}</span>
                  <span className="block text-xs text-mute-dark">{cfg.currencyLabel}</span>
                </span>
                {active && <Check className="h-4 w-4 text-volt" aria-hidden />}
              </button>
            );
          })}
          <p className="border-t border-white/8 px-3 pt-2.5 pb-1.5 mt-1 text-xs leading-relaxed text-mute-dark">{m.region.changeNote}</p>
        </div>
      )}
    </div>
  );
}
