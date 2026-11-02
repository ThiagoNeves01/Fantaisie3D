"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { reorder } from "@/app/actions/cart";
import { href } from "@/lib/stores";

export function ReorderButton({ orderId }: { orderId: string }) {
  const { store, m } = useI18n();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  if (done) return <p role="status" className="text-sm">{m.account.reordered} <Link href={href(store, "cart")} className="link">{m.product.goToCart}</Link></p>;
  return (
    <button type="button" className="btn-ghost btn-sm" disabled={pending} data-testid="reorder"
      onClick={() => start(async () => { const r = await reorder(store, orderId); if (r.ok) { setDone(true); router.refresh(); } })}>
      <RotateCcw className="h-4 w-4" aria-hidden />{m.account.reorder}
    </button>
  );
}
