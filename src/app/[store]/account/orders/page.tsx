import type { Metadata } from "next";
import Link from "next/link";
import { resolveStore } from "@/lib/request";
import { requireUser } from "@/lib/require-user";
import { getUserOrders } from "@/lib/orders";
import { href } from "@/lib/stores";
import { OrderCard } from "@/components/order-card";

export async function generateMetadata({ params }: PageProps<"/[store]/account/orders">): Promise<Metadata> {
  const { m } = await resolveStore(params);
  return { title: m.account.orders, robots: { index: false } };
}

export default async function OrdersPage({ params }: PageProps<"/[store]/account/orders">) {
  const { store, m } = await resolveStore(params);
  const user = await requireUser(store);
  const orders = await getUserOrders(user.id);
  return (
    <section>
      <h2 className="mb-5 font-display text-2xl font-semibold">{m.account.orders}</h2>
      {orders.length ? <div className="space-y-4">{orders.map((o) => <OrderCard key={o.id} o={o} store={store} m={m} />)}</div> : (
        <div className="rounded-[1.75rem] border border-dashed border-ink/15 p-10 text-center">
          <p className="text-mute">{m.account.noOrders}</p>
          <Link href={href(store, "products")} className="btn-ink mt-5">{m.home.ctaExplore}</Link>
        </div>
      )}
    </section>
  );
}
