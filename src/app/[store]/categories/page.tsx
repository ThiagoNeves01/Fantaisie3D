import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { resolveStore } from "@/lib/request";
import { getCategories } from "@/lib/catalog";
import { languageAlternates } from "@/lib/alternates";
import { href } from "@/lib/stores";
import { fmt } from "@/i18n";

export async function generateMetadata({ params }: PageProps<"/[store]/categories">): Promise<Metadata> {
  const { store, m } = await resolveStore(params);
  return { title: m.nav.categories, alternates: await languageAlternates(store, ["categories"]) };
}

export default async function CategoriesPage({ params }: PageProps<"/[store]/categories">) {
  const { store, m } = await resolveStore(params);
  const cats = (await getCategories(store)).filter((c) => c.count > 0);
  return (
    <div className="container-x py-14">
      <h1 className="text-3xl font-semibold sm:text-[2.6rem]">{m.nav.categories}</h1>
      <p className="mt-3 max-w-xl text-mute">{m.home.categoriesSubtitle}</p>
      <ul className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c) => (
          <li key={c.key} className="group relative flex flex-col items-center text-center">
            <div className="relative aspect-square w-full max-w-[18rem] overflow-hidden rounded-full bg-metal">
              {c.image && <Image src={c.image} alt="" fill sizes="18rem" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
            </div>
            <h2 className="mt-6 text-xl font-semibold">
              <Link href={href(store, "category", c.slug)} className="after:absolute after:inset-0 after:content-['']">{c.name}</Link>
            </h2>
            <p className="mt-2 max-w-[34ch] text-sm text-mute">{c.description}</p>
            <p className="mt-3 text-sm font-medium text-teal">{fmt(m.catalog.results, { count: c.count })}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
