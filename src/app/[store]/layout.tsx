import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "../globals.css";
import { I18nProvider } from "@/components/i18n-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getCategories } from "@/lib/catalog";
import { getCartCount } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { resolveStore } from "@/lib/request";
import { STORES, STORE_KEYS } from "@/lib/stores";
import { appUrl } from "@/lib/mailer";

const sora = localFont({
  src: "../../../node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2",
  variable: "--font-sora",
  weight: "100 800",
  display: "swap",
});
const inter = localFont({
  src: [
    { path: "../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", style: "normal" },
    { path: "../../../node_modules/@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2", style: "normal" },
  ],
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

export function generateStaticParams() {
  return STORE_KEYS.map((store) => ({ store }));
}

export const viewport: Viewport = { themeColor: "#101113", width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: LayoutProps<"/[store]">): Promise<Metadata> {
  const { m, cfg } = await resolveStore(params);
  return {
    metadataBase: new URL(appUrl()),
    title: { default: m.meta.defaultTitle, template: `%s | Fantaisie 3D` },
    description: m.meta.defaultDescription,
    applicationName: "Fantaisie 3D",
    openGraph: {
      siteName: "Fantaisie 3D", locale: cfg.locale.replace("-", "_"), type: "website",
      images: [{ url: "/images/hero-main.webp", width: 1920, height: 1080 }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function StoreLayout({ children, params }: LayoutProps<"/[store]">) {
  const { store, m } = await resolveStore(params);
  const [categories, cartCount, user] = await Promise.all([getCategories(store), getCartCount(store), getCurrentUser()]);
  const navCats = categories.map((c) => ({ key: c.key, name: c.name, slug: c.slug, image: c.image, description: c.description }));
  return (
    <html lang={STORES[store].locale} className={`${sora.variable} ${inter.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <I18nProvider store={store} messages={m}>
          <Header categories={navCats} cartCount={cartCount} userName={user?.name ?? null} />
          <main id="conteudo" className="flex-1">{children}</main>
          <Footer store={store} m={m} categories={navCats} />
        </I18nProvider>
      </body>
    </html>
  );
}
