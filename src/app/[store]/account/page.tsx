import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { resolveStore } from "@/lib/request";
import { requireUser } from "@/lib/require-user";
import { getUserOrders } from "@/lib/orders";
import { href, STORES, storeForLocale } from "@/lib/stores";
import { fmt } from "@/i18n";
import { OrderCard } from "@/components/order-card";
import { ResendVerification } from "@/components/account-forms";
import { RegionSwitcher } from "@/components/region-switcher";
import { Flag } from "@/components/flags";

export async function generateMetadata({ params }: PageProps<"/[store]/account">): Promise<Metadata> {
  const { m } = await resolveStore(params);
  return { title: m.account.title, robots: { index: false } };
}

export default async function AccountPage({ params, searchParams }: PageProps<"/[store]/account">) {
  const { store, m } = await resolveStore(params);
  const user = await requireUser(store);
  const sp = await searchParams;
  const orders = (await getUserOrders(user.id)).slice(0, 2);
  const pref = STORES[storeForLocale(user.preferredLocale)];
  const a = m.account;
  return (
    <div className="space-y-8">
      {sp.welcome && (
        <p role="status" className="rounded-2xl bg-teal/10 px-5 py-4 text-sm text-teal-ink" data-testid="welcome">{fmt(m.auth.registered, { email: user.email })}</p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[1.75rem] bg-metal p-6">
          <h2 className="font-display text-lg font-semibold">{a.profile}</h2>
          <p className="mt-3 font-medium">{user.name}</p>
          <p className="text-sm text-mute">{user.email}</p>
          <p className={`mt-3 flex items-center gap-2 text-sm ${user.emailVerifiedAt ? "text-ok" : "text-danger"}`} data-testid="email-status">
            {user.emailVerifiedAt ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <AlertCircle className="h-4 w-4" aria-hidden />}
            {user.emailVerifiedAt ? a.emailVerified : a.emailUnverified}
          </p>
          {!user.emailVerifiedAt && <ResendVerification />}
          <Link href={href(store, "account", "profile")} className="mt-4 inline-block text-sm font-medium text-teal hover:underline">{m.common.edit}</Link>
        </section>
        <section className="layer-lines rounded-[1.75rem] bg-ink p-6 text-metal">
          <h2 className="font-display text-lg font-semibold text-white">{a.preferences}</h2>
          <p className="mt-3 flex items-center gap-2 font-medium text-white" data-testid="pref-store">
            <Flag market={pref.market} className="h-4 w-6 rounded-[3px]" />{pref.countryName} — {pref.languageName} ({pref.currencyLabel})
          </p>
          <p className="mt-2 text-sm text-metal/65">{a.preferencesText}</p>
          <div className="mt-4"><RegionSwitcher variant="menu" /></div>
        </section>
      </div>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{a.orders}</h2>
          {orders.length > 0 && <Link href={href(store, "account", "orders")} className="text-sm font-medium text-teal hover:underline">{m.common.seeAll}</Link>}
        </div>
        {orders.length ? <div className="space-y-4">{orders.map((o) => <OrderCard key={o.id} o={o} store={store} m={m} />)}</div>
          : <p className="rounded-[1.75rem] border border-dashed border-ink/15 p-8 text-center text-mute">{a.noOrders}</p>}
      </section>
    </div>
  );
}
