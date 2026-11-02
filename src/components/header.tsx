"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronDown } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { RegionSwitcher } from "./region-switcher";
import { SearchBox } from "./search-box";
import { href, STORES } from "@/lib/stores";

type Cat = { key: string; name: string; slug: string; image: string | null; description: string | null };

export function Header({ categories, cartCount, userName }: { categories: Cat[]; cartCount: number; userName: string | null }) {
  const { store, m } = useI18n();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const catsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // fecha menus ao navegar (ajuste de estado durante a renderização, padrão recomendado pelo React)
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) { setPrevPath(pathname); setMenuOpen(false); setSearchOpen(false); setCatsOpen(false); }
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const nav = [
    { label: m.nav.home, href: href(store) },
    { label: m.nav.products, href: href(store, "products") },
    { label: m.nav.categories, href: href(store, "categories"), dropdown: true },
    { label: m.nav.custom, href: href(store, "custom") },
    { label: m.nav.about, href: href(store, "about") },
    { label: m.nav.contact, href: href(store, "contact") },
  ];
  const isActive = (h: string) => (h === href(store) ? pathname === h : pathname.startsWith(h));
  const cfg = STORES[store];

  const iconBtn = "relative flex h-10 w-10 items-center justify-center rounded-full text-metal/85 transition-colors hover:bg-white/8 hover:text-white";

  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-ink/95 text-metal backdrop-blur supports-[backdrop-filter]:bg-ink/85">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-volt focus:px-4 focus:py-2 focus:text-ink">
        {m.nav.skipToContent}
      </a>
      <div className="container-x flex h-[4.25rem] items-center gap-2 lg:gap-6">
        <button type="button" className={`${iconBtn} lg:hidden`} aria-label={m.nav.menu} aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} data-testid="menu-button">
          <Menu className="h-5 w-5" />
        </button>

        <Link href={href(store)} className="flex shrink-0 items-center gap-2.5" aria-label={`Fantaisie 3D, ${m.nav.home}`}>
          <Image src="/brand/emblem-96.png" alt="" width={44} height={44} priority className="h-11 w-11" />
          <span className="hidden font-display text-[1.05rem] font-semibold tracking-[0.02em] text-white sm:block">
            Fantaisie <span className="text-volt">3D</span>
          </span>
        </Link>

        <nav aria-label={m.nav.menu} className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => (
              <li key={n.href} className="relative"
                onPointerEnter={(e) => { if (n.dropdown && e.pointerType === "mouse") { if (catsTimer.current) clearTimeout(catsTimer.current); setCatsOpen(true); } }}
                onPointerLeave={(e) => { if (n.dropdown && e.pointerType === "mouse") catsTimer.current = setTimeout(() => setCatsOpen(false), 160); }}>
                {n.dropdown ? (
                  <button type="button" aria-expanded={catsOpen} onClick={() => setCatsOpen((v) => !v)}
                    className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.92rem] transition-colors hover:text-white ${isActive(n.href) || pathname.startsWith(href(store, "category")) ? "text-white" : "text-metal/75"}`}>
                    {n.label}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${catsOpen ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                ) : (
                  <Link href={n.href} aria-current={isActive(n.href) ? "page" : undefined}
                    className={`relative block rounded-full px-3.5 py-2 text-[0.92rem] transition-colors hover:text-white ${isActive(n.href) ? "text-white" : "text-metal/75"}`}>
                    {n.label}
                    {isActive(n.href) && <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-volt" aria-hidden />}
                  </Link>
                )}
                {n.dropdown && catsOpen && (
                  <div className="pop-in absolute top-full left-1/2 z-50 mt-3 w-[34rem] -translate-x-1/2 rounded-[2rem] border border-white/10 bg-graphite p-3 shadow-[0_30px_70px_-25px_rgb(0_0_0/0.8)]">
                    <ul className="grid grid-cols-2 gap-1">
                      {categories.map((c) => (
                        <li key={c.key}>
                          <Link href={href(store, "category", c.slug)} className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-white/6">
                            {c.image && <Image src={c.image} alt="" width={56} height={56} className="h-14 w-14 rounded-full bg-metal object-cover" />}
                            <span>
                              <span className="block text-sm font-medium text-white">{c.name}</span>
                              <span className="line-clamp-2 text-xs leading-snug text-mute-dark">{c.description}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href={href(store, "categories")} className="mt-1 block rounded-2xl px-3 py-2.5 text-sm text-volt hover:bg-white/6">{m.nav.allCategories}</Link>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
          <button type="button" className={iconBtn} aria-label={m.nav.search} aria-expanded={searchOpen} onClick={() => setSearchOpen((v) => !v)} data-testid="search-toggle">
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
          <Link href={href(store, "account", "favorites")} className={`${iconBtn} hidden sm:flex`} aria-label={m.nav.favorites}>
            <Heart className="h-5 w-5" />
          </Link>
          <Link href={userName ? href(store, "account") : href(store, "login")} className={`${iconBtn} hidden sm:flex`} aria-label={userName ? m.nav.account : m.nav.login} data-testid="account-link">
            <User className="h-5 w-5" />
            {userName && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-volt ring-2 ring-ink" aria-hidden />}
          </Link>
          <Link href={href(store, "cart")} className={iconBtn} aria-label={`${m.nav.cart} (${cartCount})`} data-testid="cart-link">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-volt px-1 text-[0.7rem] font-bold text-ink" data-testid="cart-count">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" aria-hidden />
          <RegionSwitcher />
        </div>
      </div>

      {searchOpen && (
        <div className="pop-in border-t border-white/6 bg-ink">
          <div className="container-x py-4">
            <div className="mx-auto max-w-2xl"><SearchBox autoFocus onDone={() => setSearchOpen(false)} /></div>
          </div>
        </div>
      )}

      {/* Menu mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={m.nav.menu}>
          <button type="button" className="absolute inset-0 bg-ink/60" aria-label={m.nav.close} onClick={() => setMenuOpen(false)} />
          <div className="pop-in layer-lines absolute inset-y-0 left-0 flex w-[min(24rem,88vw)] flex-col overflow-y-auto bg-ink p-5">
            <div className="mb-5 flex items-center justify-between">
              <Image src={cfg.logo} alt="Fantaisie 3D" width={64} height={64} className="h-16 w-16" />
              <button type="button" className={iconBtn} aria-label={m.nav.close} onClick={() => setMenuOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <SearchBox onDone={() => setMenuOpen(false)} />
            <nav className="mt-5" aria-label={m.nav.menu}>
              <ul className="space-y-0.5">
                {nav.filter((n) => !n.dropdown).map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className={`block rounded-2xl px-4 py-3 font-display text-lg ${isActive(n.href) ? "bg-white/6 text-white" : "text-metal/85"}`}>{n.label}</Link>
                  </li>
                ))}
              </ul>
              <p className="mt-5 mb-2 px-4 text-sm text-mute-dark">{m.nav.categories}</p>
              <ul className="grid grid-cols-2 gap-2">
                {categories.map((c) => (
                  <li key={c.key}>
                    <Link href={href(store, "category", c.slug)} className="flex flex-col items-center gap-2 rounded-2xl p-3 text-center text-sm text-metal hover:bg-white/6">
                      {c.image && <Image src={c.image} alt="" width={64} height={64} className="h-16 w-16 rounded-full bg-metal object-cover" />}
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <Link href={userName ? href(store, "account") : href(store, "login")} className="btn-ghost-dark btn-sm"><User className="h-4 w-4" />{userName ? m.nav.account : m.nav.login}</Link>
              <Link href={href(store, "account", "favorites")} className="btn-ghost-dark btn-sm"><Heart className="h-4 w-4" />{m.nav.favorites}</Link>
            </div>
            <div className="mt-4"><RegionSwitcher variant="menu" /></div>
          </div>
        </div>
      )}
    </header>
  );
}
