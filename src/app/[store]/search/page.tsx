import type { Metadata } from "next";
import { resolveStore } from "@/lib/request";
import { CatalogView } from "@/components/catalog-view";
import { fmt } from "@/i18n";

export async function generateMetadata({ params }: PageProps<"/[store]/search">): Promise<Metadata> {
  const { m } = await resolveStore(params);
  return { title: m.nav.search, robots: { index: false } };
}

export default async function SearchPage({ params, searchParams }: PageProps<"/[store]/search">) {
  const { store, m } = await resolveStore(params);
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.slice(0, 60) ?? "";
  return <CatalogView store={store} m={m} title={q ? fmt(m.catalog.searchResults, { q }) : m.nav.search} sp={{ ...sp, q }} />;
}
