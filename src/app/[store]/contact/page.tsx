import type { Metadata } from "next";
import { Clock, Mail } from "lucide-react";
import { resolveStore } from "@/lib/request";
import { getCurrentUser } from "@/lib/auth";
import { languageAlternates } from "@/lib/alternates";
import { ContactForm } from "@/components/contact-form";
import { InstagramIcon, SOCIAL, TikTokIcon } from "@/components/footer";

export async function generateMetadata({ params }: PageProps<"/[store]/contact">): Promise<Metadata> {
  const { store, m } = await resolveStore(params);
  return { title: m.contact.title, alternates: await languageAlternates(store, ["contact"]) };
}

export default async function ContactPage({ params }: PageProps<"/[store]/contact">) {
  const { store, m } = await resolveStore(params);
  const user = await getCurrentUser();
  const c = m.contact;
  const email = store === "br" ? "contato@fantaisie3d.com" : "hello@fantaisie3d.com";
  return (
    <div className="on-light container-x grid gap-12 py-14 lg:grid-cols-[1fr_22rem]">
      <div>
        <h1 className="text-3xl font-semibold sm:text-[2.6rem]">{c.title}</h1>
        <p className="mt-3 max-w-xl text-mute">{c.subtitle}</p>
        <div className="mt-10"><ContactForm defaults={{ name: user?.name, email: user?.email }} /></div>
      </div>
      <aside className="layer-lines h-fit space-y-6 rounded-[2rem] bg-ink p-7 text-metal">
        <div className="flex gap-3"><Mail className="mt-0.5 h-5 w-5 text-volt" aria-hidden /><div><p className="text-sm text-metal/60">{c.emailLabel}</p><a href={`mailto:${email}`} className="font-medium text-white hover:text-volt">{email}</a></div></div>
        <div className="flex gap-3"><Clock className="mt-0.5 h-5 w-5 text-volt" aria-hidden /><div><p className="text-sm text-metal/60">{c.hours}</p><p className="text-white">{c.hoursValue}</p></div></div>
        <div>
          <p className="mb-3 text-sm text-metal/60">{c.social}</p>
          <div className="flex flex-col gap-2">
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white hover:text-volt"><InstagramIcon />@fantaisie3d</a>
            <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white hover:text-volt"><TikTokIcon />@fantaisie3d</a>
          </div>
        </div>
      </aside>
    </div>
  );
}
