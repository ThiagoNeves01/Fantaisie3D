"use client";
import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { toggleFavorite } from "@/app/actions/favorites";
import { href } from "@/lib/stores";

export function FavoriteButton({ productId, initial, variant = "card" }: { productId: string; initial: boolean; variant?: "card" | "page" }) {
  const { store, m } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [fav, setFav] = useState(initial);
  const [, start] = useTransition();
  const label = fav ? m.product.removeFromFavorites : m.product.addToFavorites;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    start(async () => {
      const prev = fav;
      setFav(!prev);
      const r = await toggleFavorite(store, productId);
      if (!r.ok) setFav(prev);
      else if (typeof r.favorite === "boolean") setFav(r.favorite);
      if (r.needsLogin) router.push(`${href(store, "login")}?next=${encodeURIComponent(pathname)}&fav=1`);
    });
  };

  if (variant === "page") {
    return (
      <button type="button" onClick={onClick} aria-pressed={fav} className="btn-ghost h-12 w-full sm:w-auto" data-testid="favorite-page">
        <Heart className={`h-5 w-5 ${fav ? "fill-teal text-teal" : ""}`} aria-hidden />{label}
      </button>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-pressed={fav} aria-label={label} title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur transition-colors hover:bg-white">
      <Heart className={`h-[1.1rem] w-[1.1rem] transition-colors ${fav ? "fill-teal text-teal" : ""}`} aria-hidden />
    </button>
  );
}
