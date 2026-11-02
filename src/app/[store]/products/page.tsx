import type { Metadata } from "next";
import { resolveStore } from "@/lib/request";
import { languageAlternates } from "@/lib/alternates";
import { CatalogView } from "@/components/catalog-view";

export async function generateMetadata({ params }: PageProps<"/[store]/products">): Promise<Metadata> {
  const { store, m } = await resolveStore(params);
  return { title: m.catalog.title, description: m.catalog.description, alternates: await languageAlternates(store, ["products"]) };
}

export default async function ProductsPage({ params, searchParams }: PageProps<"/[store]/products">) {
  const { store, m } = await resolveStore(params);
  return <CatalogView store={store} m={m} title={m.catalog.title} description={m.catalog.description} sp={await searchParams} />;
}
