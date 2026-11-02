import Link from "next/link";
import Image from "next/image";
import { href, STORES, type StoreKey } from "@/lib/stores";
import { fmt, type Messages } from "@/i18n";
import { NewsletterForm } from "./newsletter-form";

export function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function TikTokIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.6 3c.4 2.2 1.8 3.7 4 3.9v3.1c-1.5.1-2.8-.4-4-1.2v6.1c0 3.4-2.5 5.6-5.6 5.6S5.4 18.2 5.4 15.2c0-3.3 2.9-5.8 6.4-5.3v3.2c-1.6-.4-3.2.6-3.2 2.1 0 1.3 1 2.3 2.4 2.3 1.5 0 2.4-1 2.4-2.6V3h3.2Z" />
    </svg>
  );
}

export const SOCIAL = {
  instagram: "https://www.instagram.com/fantaisie3d",
  tiktok: "https://www.tiktok.com/@fantaisie3d",
};

export function Footer({ store, m, categories }: { store: StoreKey; m: Messages; categories: { key: string; name: string; slug: string }[] }) {
  const f = m.footer;
  const cfg = STORES[store];
  const col = "space-y-2.5 text-sm text-metal/70";
  const a = "transition-colors hover:text-white";
  return (
    <footer className="layer-lines relative mt-24 bg-ink text-metal">
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr]">
        <div className="max-w-sm">
          <Image src={cfg.logo} alt="Fantaisie 3D" width={112} height={112} className="h-28 w-28" />
          <p className="mt-5 text-sm leading-relaxed text-metal/70">{f.about}</p>
          <p className="mt-6 text-sm font-medium text-white">{f.follow}</p>
          <div className="mt-3 flex gap-2">
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram @fantaisie3d" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-metal transition-colors hover:border-volt/70 hover:text-volt"><InstagramIcon /></a>
            <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok @fantaisie3d" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-metal transition-colors hover:border-volt/70 hover:text-volt"><TikTokIcon /></a>
          </div>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <h2 className="mb-4 text-sm font-semibold text-white">{f.shop}</h2>
            <ul className={col}>
              <li><Link className={a} href={href(store, "products")}>{m.nav.products}</Link></li>
              {categories.map((c) => <li key={c.key}><Link className={a} href={href(store, "category", c.slug)}>{c.name}</Link></li>)}
              <li><Link className={a} href={href(store, "custom")}>{m.nav.custom}</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-sm font-semibold text-white">{f.help}</h2>
            <ul className={col}>
              <li><Link className={a} href={href(store, "faq")}>{f.faq}</Link></li>
              <li><Link className={a} href={href(store, "shipping")}>{f.shipping}</Link></li>
              <li><Link className={a} href={href(store, "returns")}>{f.returns}</Link></li>
              <li><Link className={a} href={href(store, "contact")}>{m.nav.contact}</Link></li>
              <li><Link className={a} href={href(store, "account")}>{m.nav.account}</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-sm font-semibold text-white">{f.company}</h2>
            <ul className={col}>
              <li><Link className={a} href={href(store, "about")}>{m.nav.about}</Link></li>
              <li><Link className={a} href={href(store, "privacy")}>{f.privacy}</Link></li>
              <li><Link className={a} href={href(store, "terms")}>{f.terms}</Link></li>
            </ul>
            <h2 className="mt-8 mb-3 text-sm font-semibold text-white">{f.payments}</h2>
            <ul className="flex flex-wrap gap-1.5">
              {f.paymentMethods.split(" · ").map((p) => (
                <li key={p} className="rounded-full border border-white/12 px-2.5 py-1 text-xs text-metal/80">{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="container-x">
        <div className="grid gap-6 rounded-[2rem] border border-white/8 bg-graphite/60 p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">{m.home.newsletterTitle}</h2>
            <p className="mt-1.5 text-sm text-metal/70">{m.home.newsletterText}</p>
          </div>
          <NewsletterForm dark />
        </div>
      </div>
      <div className="container-x flex flex-col gap-2 py-8 text-xs text-metal/50 sm:flex-row sm:justify-between">
        <p>{fmt(f.rights, { year: new Date().getFullYear() })}</p>
        <p>{f.legal}</p>
      </div>
    </footer>
  );
}
