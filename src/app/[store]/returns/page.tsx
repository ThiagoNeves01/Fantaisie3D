import type { Metadata } from "next";
import { resolveStore } from "@/lib/request";
import { languageAlternates } from "@/lib/alternates";
import { ContentPage, getPage } from "@/components/content-page";

export async function generateMetadata({ params }: PageProps<"/[store]/returns">): Promise<Metadata> {
  const { store } = await resolveStore(params);
  const page = await getPage(store, "returns");
  return { title: page?.title, alternates: await languageAlternates(store, ["returns"]) };
}

export default async function Page({ params }: PageProps<"/[store]/returns">) {
  const { store, m } = await resolveStore(params);
  return <ContentPage store={store} m={m} pageKey="returns" legal={true} />;
}
