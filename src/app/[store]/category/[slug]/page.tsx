import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveStore } from "@/lib/request";
import { getCategoryBySlug } from "@/lib/catalog";
import { languageAlternates } from "@/lib/alternates";
import { CatalogView } from "@/components/catalog-view";

export async function generateMetadata({ params }: PageProps<"/[store]/category/[slug]">): Promise<Metadata> {
  const { store } = await resolveStore(params);
  const { slug } = await params;
  const cat = await getCategoryBySlug(store, slug);
  if (!cat) return {};
  return { title: cat.name, description: cat.description ?? undefined, alternates: await languageAlternates(store, ["category", slug]) };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[store]/category/[slug]">) {
  const { store, m } = await resolveStore(params);
  const { slug } = await params;
  const cat = await getCategoryBySlug(store, decodeURIComponent(slug));
  if (!cat) notFound();
  return <CatalogView store={store} m={m} title={cat.name} description={cat.description} sp={await searchParams} categorySlug={cat.slug} />;
}
