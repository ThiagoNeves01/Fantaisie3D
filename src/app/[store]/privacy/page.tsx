import type { Metadata } from "next";
import { resolveStore } from "@/lib/request";
import { languageAlternates } from "@/lib/alternates";
import { ContentPage, getPage } from "@/components/content-page";

export async function generateMetadata({ params }: PageProps<"/[store]/privacy">): Promise<Metadata> {
  const { store } = await resolveStore(params);
  const page = await getPage(store, "privacy");
  return { title: page?.title, alternates: await languageAlternates(store, ["privacy"]) };
}

export default async function Page({ params }: PageProps<"/[store]/privacy">) {
  const { store, m } = await resolveStore(params);
  return <ContentPage store={store} m={m} pageKey="privacy" legal={true} />;
}
