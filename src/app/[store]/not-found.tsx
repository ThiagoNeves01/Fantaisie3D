"use client";
import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import { href } from "@/lib/stores";

export default function NotFound() {
  const { store, m } = useI18n();
  return (
    <div className="container-x py-28 text-center">
      <svg viewBox="0 0 200 80" className="mx-auto h-20 w-48" aria-hidden>
        <ellipse cx="100" cy="40" rx="96" ry="26" transform="rotate(-8 100 40)" fill="none" stroke="#087F89" strokeWidth="1.4" />
        <text x="100" y="52" textAnchor="middle" fontFamily="var(--font-display)" fontSize="38" fontWeight="600" fill="#101113">404</text>
      </svg>
      <h1 className="mt-6 text-3xl font-semibold">{m.common.notFoundTitle}</h1>
      <p className="mt-2 text-mute">{m.common.notFoundText}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={href(store)} className="btn-ink">{m.common.goHome}</Link>
        <Link href={href(store, "products")} className="btn-ghost">{m.nav.products}</Link>
      </div>
    </div>
  );
}
