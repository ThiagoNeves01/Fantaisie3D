import type { Metadata } from "next";
import { resolveStore } from "@/lib/request";
import { languageAlternates } from "@/lib/alternates";
import { ContentPage, getPage } from "@/components/content-page";

export async function generateMetadata({ params }: PageProps<"/[store]/terms">): Promise<Metadata> {
  const { store } = await resolveStore(params);
  const page = await getPage(store, "terms");
  return { title: page?.title, alternates: await languageAlternates(store, ["terms"]) };
}

export default async function Page({ params }: PageProps<"/[store]/terms">) {
  const { store, m } = await resolveStore(params);
  return <ContentPage store={store} m={m} pageKey="terms" legal={true} />;
}
