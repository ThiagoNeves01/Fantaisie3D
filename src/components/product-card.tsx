import Link from "next/link";
import Image from "next/image";
import { FavoriteButton } from "./favorite-button";
import { Badges, Price, Stars } from "./product-bits";
import { QuickAdd } from "./quick-add";
import type { ProductCardData } from "@/lib/catalog";
import { href, type StoreKey } from "@/lib/stores";
import type { Messages } from "@/i18n";

/**
 * Cartão de produto: a peça repousa num "prato" claro; o texto fica solto, sem caixa.
 * Ao passar o mouse, mostra o segundo ângulo da peça.
 */
export function ProductCard({ p, store, m, favorite = false, priority = false }: { p: ProductCardData; store: StoreKey; m: Messages; favorite?: boolean; priority?: boolean }) {
  const url = href(store, "product", p.slug);
  return (
    <article className="group relative flex flex-col" data-testid="product-card">
      <div className="plate aspect-square">
        <Link href={url} className="absolute inset-0" tabIndex={-1} aria-hidden>
          {p.image && (
            <Image src={p.image} alt="" fill sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 46vw" priority={priority}
              className={`object-cover transition-opacity duration-500 ${p.image2 ? "group-hover:opacity-0" : ""}`} />
          )}
          {p.image2 && (
            <Image src={p.image2} alt="" fill sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 46vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          )}
        </Link>
        <div className="pointer-events-none absolute top-3 left-3 right-14"><Badges p={p} m={m} /></div>
        <div className="absolute top-3 right-3 z-10"><FavoriteButton productId={p.id} initial={favorite} /></div>
        {p.isSample && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/80 px-2 py-0.5 text-[0.65rem] text-mute backdrop-blur" title={m.common.sampleNote}>
            {m.common.sampleBadge}
          </span>
        )}
      </div>
      <div className="mt-3.5 flex flex-1 flex-col gap-1 px-1">
        <h3 className="font-display text-[1rem] leading-snug font-medium text-ink">
          <Link href={url} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">{p.name}</Link>
        </h3>
        <Stars value={p.ratingAvg} count={p.ratingCount} m={m} small />
        <div className="mt-1 flex items-end justify-between gap-2">
          <div>
            <Price store={store} price={p.price} salePrice={p.salePrice} m={m} />
            {p.madeToOrder && <p className="text-xs text-mute">{m.badges.madeToOrder}</p>}
          </div>
          <div className="relative z-10">
            <QuickAdd productId={p.id} name={p.name} url={url} customizable={p.customizable} />
          </div>
        </div>
      </div>
    </article>
  );
}
