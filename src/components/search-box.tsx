"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { href } from "@/lib/stores";
import { fmt } from "@/i18n";

type Suggestion = { name: string; href: string; image: string | null; price: string };

/** Busca com sugestões automáticas (combobox acessível) e tratamento de "sem resultados". */
export function SearchBox({ onDone, autoFocus = false }: { onDone?: () => void; autoFocus?: boolean }) {
  const { store, m } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const listId = useId();
  const shown = q.trim().length >= 2 ? items : [];
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);

  useEffect(() => {
    if (q.trim().length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/search?store=${store}&q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = await r.json();
        setItems(data.items); setActive(-1); setOpen(true);
      } catch { /* cancelado */ } finally { setLoading(false); }
    }, 180);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, store]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (active >= 0 && items[active]) { router.push(items[active].href); }
    else if (q.trim()) router.push(`${href(store, "search")}?q=${encodeURIComponent(q.trim())}`);
    setOpen(false); onDone?.();
  };

  return (
    <form role="search" onSubmit={submit} className="relative w-full">
      <label htmlFor={`${listId}-input`} className="sr-only">{m.nav.search}</label>
      <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-mute" aria-hidden />
      <input
        ref={inputRef}
        id={`${listId}-input`}
        type="search"
        role="combobox"
        aria-expanded={open && q.length >= 2}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        value={q}
        maxLength={60}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => items.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, items.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
          if (e.key === "Escape") { setOpen(false); }
        }}
        placeholder={m.nav.searchPlaceholder}
        className="h-11 w-full rounded-full border border-ink/10 bg-white pr-10 pl-11 text-[0.95rem] text-ink placeholder:text-mute focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
        data-testid="search-input"
      />
      {q && (
        <button type="button" onClick={() => { setQ(""); inputRef.current?.focus(); }} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-mute hover:text-ink" aria-label={m.common.remove}>
          <X className="h-4 w-4" />
        </button>
      )}
      {open && q.trim().length >= 2 && (
        <div className="pop-in absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-3xl border border-ink/8 bg-white text-ink shadow-[0_24px_60px_-24px_rgb(16_17_19/0.45)]">
          <ul id={listId} role="listbox" aria-label={m.catalog.suggestions} className="max-h-[60vh] overflow-auto p-2">
            {shown.map((it, i) => (
              <li key={it.href} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                <Link href={it.href} onClick={() => { setOpen(false); onDone?.(); }}
                  className={`flex items-center gap-3 rounded-2xl p-2 ${i === active ? "bg-metal" : "hover:bg-metal"}`}>
                  {it.image && <Image src={it.image} alt="" width={48} height={48} className="h-12 w-12 rounded-xl bg-metal object-cover" />}
                  <span className="flex-1 text-sm font-medium">{it.name}</span>
                  <span className="text-sm text-mute">{it.price}</span>
                </Link>
              </li>
            ))}
            {!shown.length && !loading && (
              <li className="px-3 py-4 text-sm text-mute" role="option" aria-selected={false}>
                {fmt(m.catalog.searchEmpty, { q })} {m.catalog.searchSuggestion}
              </li>
            )}
          </ul>
          {shown.length > 0 && (
            <button type="submit" className="w-full border-t border-ink/8 px-5 py-3 text-left text-sm font-medium text-teal hover:bg-metal">
              {m.catalog.viewAllResults}
            </button>
          )}
        </div>
      )}
    </form>
  );
}
