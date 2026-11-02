"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Heart, LayoutGrid, LogOut, MapPin, Package, UserRound } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { logout } from "@/app/actions/auth";
import { href } from "@/lib/stores";

export function AccountNav() {
  const { store, m } = useI18n();
  const a = m.account;
  const pathname = usePathname();
  const items = [
    { label: a.overview, href: href(store, "account"), icon: LayoutGrid, exact: true },
    { label: a.orders, href: href(store, "account", "orders"), icon: Package },
    { label: a.favorites, href: href(store, "account", "favorites"), icon: Heart },
    { label: a.quotes, href: href(store, "account", "quotes"), icon: FileText },
    { label: a.addresses, href: href(store, "account", "addresses"), icon: MapPin },
    { label: a.profile, href: href(store, "account", "profile"), icon: UserRound },
  ];
  return (
    <nav aria-label={a.title}>
      <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:px-0">
        {items.map((it) => {
          const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
          return (
            <li key={it.href} className="shrink-0">
              <Link href={it.href} aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm whitespace-nowrap transition-colors lg:rounded-2xl ${active ? "bg-ink text-metal" : "bg-metal hover:bg-metal-2 lg:bg-transparent lg:hover:bg-metal"}`}>
                <it.icon className="h-4 w-4" aria-hidden />{it.label}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0 lg:mt-4 lg:border-t lg:border-ink/8 lg:pt-4">
          <form action={logout.bind(null, store)}>
            <button className="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm text-mute hover:text-danger lg:rounded-2xl" data-testid="logout">
              <LogOut className="h-4 w-4" aria-hidden />{m.nav.logout}
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
