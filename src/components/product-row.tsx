import Link from "next/link";
import { ProductCard } from "./product-card";
import type { ProductCardData } from "@/lib/catalog";
import type { StoreKey } from "@/lib/stores";
import type { Messages } from "@/i18n";

/** Seção de vitrine: título à esquerda, "ver tudo" à direita, grade que vira carrossel no celular. */
export function ProductRow({ id, title, items, store, m, favorites, seeAllHref, subtitle }: {
  id: string; title: string; subtitle?: string; items: ProductCardData[]; store: StoreKey; m: Messages; favorites: Set<string>; seeAllHref?: string;
}) {
  if (!items.length) return null;
  return (
    <section aria-labelledby={id} className="container-x mt-20 sm:mt-24">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <h2 id={id} className="text-2xl font-semibold sm:text-[2rem]">{title}</h2>
          {subtitle && <p className="mt-2 max-w-xl text-mute">{subtitle}</p>}
        </div>
        {seeAllHref && <Link href={seeAllHref} className="shrink-0 text-sm font-medium text-teal hover:underline">{m.common.seeAll}</Link>}
      </div>
      <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 md:grid-cols-3 xl:grid-cols-4">
        {items.map((p) => (
          <li key={p.id} className="w-[72vw] max-w-[18rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
            <ProductCard p={p} store={store} m={m} favorite={favorites.has(p.id)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
