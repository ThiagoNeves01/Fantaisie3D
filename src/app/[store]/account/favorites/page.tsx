import type { Metadata } from "next";
import Link from "next/link";
import { resolveStore } from "@/lib/request";
import { requireUser } from "@/lib/require-user";
import { getFavoriteIds } from "@/lib/favorites";
import { listProducts } from "@/lib/catalog";
import { href } from "@/lib/stores";
import { ProductCard } from "@/components/product-card";

export async function generateMetadata({ params }: PageProps<"/[store]/account/favorites">): Promise<Metadata> {
  const { m } = await resolveStore(params);
  return { title: m.account.favorites, robots: { index: false } };
}

export default async function FavoritesPage({ params }: PageProps<"/[store]/account/favorites">) {
  const { store, m } = await resolveStore(params);
  await requireUser(store);
  const ids = await getFavoriteIds();
  // somente os favoritos disponíveis no país atual
  const items = ids.size ? await listProducts(store, { ids: [...ids] }) : [];
  return (
    <section>
      <h2 className="mb-5 font-display text-2xl font-semibold">{m.account.favorites}</h2>
      {items.length ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3" data-testid="favorites-list">
          {items.map((p) => <li key={p.id}><ProductCard p={p} store={store} m={m} favorite /></li>)}
        </ul>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-ink/15 p-10 text-center">
          <p className="text-mute">{m.account.noFavorites}</p>
          <Link href={href(store, "products")} className="btn-ink mt-5">{m.home.ctaExplore}</Link>
        </div>
      )}
    </section>
  );
}
