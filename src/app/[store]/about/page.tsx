import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { resolveStore } from "@/lib/request";
import { languageAlternates } from "@/lib/alternates";
import { getPage } from "@/components/content-page";
import { href } from "@/lib/stores";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: PageProps<"/[store]/about">): Promise<Metadata> {
  const { store, m } = await resolveStore(params);
  return { title: m.pages.about, alternates: await languageAlternates(store, ["about"]) };
}

export default async function AboutPage({ params }: PageProps<"/[store]/about">) {
  const { store, m, cfg } = await resolveStore(params);
  const page = await getPage(store, "about");
  if (!page) notFound();
  const [lead, ...rest] = page.body.trim().split(/\n{2,}/);
  const sections = rest.join("\n\n").split(/\n(?=## )/).map((sec) => {
    const [h, ...body] = sec.trim().split("\n");
    return { title: h.replace(/^## /, ""), lines: body.filter(Boolean) };
  });
  return (
    <>
      <section className="layer-lines relative isolate overflow-hidden bg-ink text-metal">
        <div className="container-x grid gap-10 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center lg:py-24">
          <div>
            <h1 className="text-4xl font-semibold text-white sm:text-[3.2rem]">{page.title}</h1>
            <p className="mt-6 max-w-[38ch] font-display text-xl leading-relaxed text-metal/85 sm:text-2xl">{lead}</p>
          </div>
          <Image src={cfg.logo} alt="Fantaisie 3D" width={420} height={420} className="mx-auto h-auto w-full max-w-[22rem]" priority />
        </div>
      </section>
      <div className="on-light container-x grid gap-x-14 gap-y-12 py-16 md:grid-cols-2">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-2xl font-semibold">{s.title}</h2>
            {s.lines.every((l) => l.startsWith("- ")) ? (
              <ul className="mt-4 space-y-2 text-ink/80">{s.lines.map((l) => <li key={l} className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden />{l.slice(2)}</li>)}</ul>
            ) : <p className="mt-4 max-w-[60ch] leading-relaxed text-ink/80">{s.lines.join(" ")}</p>}
          </section>
        ))}
      </div>
      <div className="container-x flex flex-wrap gap-3">
        <Link href={href(store, "products")} className="btn-ink h-12 px-7">{m.home.ctaExplore}</Link>
        <Link href={href(store, "custom")} className="btn-ghost h-12 px-7">{m.home.ctaCustom}</Link>
      </div>
    </>
  );
}
