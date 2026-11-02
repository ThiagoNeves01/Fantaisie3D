"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Plus, SlidersHorizontal } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { addToCart } from "@/app/actions/cart";

/**
 * Botão do cartão: produtos com opções obrigatórias de texto vão para "Ver detalhes";
 * os demais entram no carrinho com as opções padrão (primeira cor/tamanho).
 */
export function QuickAdd({ productId, name, url, customizable }: { productId: string; name: string; url: string; customizable: boolean }) {
  const { store, m } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  if (customizable) {
    return (
      <Link href={url} aria-label={`${m.product.viewDetails}: ${name}`} title={m.product.viewDetails}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/40 sm:w-auto sm:px-4 sm:text-sm sm:font-semibold">
        <SlidersHorizontal className="h-4 w-4 sm:hidden" aria-hidden /><span className="hidden sm:inline">{m.product.viewDetails}</span>
      </Link>
    );
  }
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`${m.product.addToCart}: ${name}`}
      title={m.product.addToCart}
      data-testid="quick-add"
      onClick={() => start(async () => {
        const r = await addToCart(store, { productId, quantity: 1, selections: [], useDefaults: true });
        if (r.ok) { setDone(true); router.refresh(); setTimeout(() => setDone(false), 1800); }
        else router.push(url);
      })}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${done ? "bg-volt text-ink" : "bg-ink text-metal hover:bg-graphite"}`}
    >
      {done ? <Check className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
      <span className="sr-only" aria-live="polite">{done ? m.product.added : ""}</span>
    </button>
  );
}
