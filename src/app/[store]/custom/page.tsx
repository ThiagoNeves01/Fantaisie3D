import type { Metadata } from "next";
import Image from "next/image";
import { resolveStore } from "@/lib/request";
import { getCurrentUser } from "@/lib/auth";
import { languageAlternates } from "@/lib/alternates";
import { QuoteForm } from "@/components/quote-form";

export async function generateMetadata({ params }: PageProps<"/[store]/custom">): Promise<Metadata> {
  const { store, m } = await resolveStore(params);
  return { title: m.custom.title, description: m.custom.subtitle, alternates: await languageAlternates(store, ["custom"]) };
}

export default async function CustomPage({ params }: PageProps<"/[store]/custom">) {
  const { store, m } = await resolveStore(params);
  const user = await getCurrentUser();
  const c = m.custom;
  return (
    <>
      <section className="layer-lines relative isolate overflow-hidden bg-ink text-metal">
        <div className="container-x grid gap-10 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center lg:py-20">
          <div>
            <h1 className="text-4xl leading-tight font-semibold text-white sm:text-[3.2rem]">{c.title}</h1>
            <p className="mt-5 max-w-[50ch] text-lg leading-relaxed text-metal/75">{c.subtitle}</p>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem]">
            <Image src="/images/banner-custom.webp" alt="" fill priority sizes="(min-width:768px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
        <ol className="container-x grid gap-6 border-t border-white/8 py-8 md:grid-cols-3">
          {c.steps.map((st, i) => (
            <li key={st.title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-volt/50 font-display text-sm text-volt" aria-hidden>{i + 1}</span>
              <div><h2 className="font-semibold text-white">{st.title}</h2><p className="mt-1 text-sm text-metal/65">{st.text}</p></div>
            </li>
          ))}
        </ol>
      </section>
      <section className="on-light container-x grid gap-10 py-14 lg:grid-cols-[1fr_20rem] lg:gap-14" aria-labelledby="form-title">
        <div>
          <h2 id="form-title" className="mb-8 text-2xl font-semibold sm:text-3xl">{c.formTitle}</h2>
          <QuoteForm defaults={{ name: user?.name, email: user?.email }} />
        </div>
        <aside className="h-fit rounded-[1.75rem] bg-metal p-6 text-sm leading-relaxed text-ink/80">
          <p>{c.ipNotice}</p>
        </aside>
      </section>
    </>
  );
}
