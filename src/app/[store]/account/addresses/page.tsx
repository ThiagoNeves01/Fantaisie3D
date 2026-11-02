import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { resolveStore } from "@/lib/request";
import { requireUser } from "@/lib/require-user";
import { AddressActions, AddressForm } from "@/components/account-forms";
import { Flag } from "@/components/flags";

export async function generateMetadata({ params }: PageProps<"/[store]/account/addresses">): Promise<Metadata> {
  const { m } = await resolveStore(params);
  return { title: m.account.addresses, robots: { index: false } };
}

export default async function AddressesPage({ params }: PageProps<"/[store]/account/addresses">) {
  const { store, m } = await resolveStore(params);
  const user = await requireUser(store);
  const list = await db.query.addresses.findMany({ where: eq(s.addresses.userId, user.id), orderBy: [desc(s.addresses.isDefault), desc(s.addresses.createdAt)] });
  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-5 font-display text-2xl font-semibold">{m.account.addresses}</h2>
        {list.length ? (
          <ul className="grid gap-4 md:grid-cols-2" data-testid="address-list">
            {list.map((a) => (
              <li key={a.id} className="rounded-[1.75rem] border border-ink/8 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-medium"><Flag market={a.country} className="h-3.5 w-5 rounded-[2px]" />{a.label ?? a.recipient}</p>
                  {a.isDefault && <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs text-metal">{m.account.defaultAddress}</span>}
                </div>
                <address className="mt-2 text-sm leading-relaxed text-ink/80 not-italic">
                  {a.recipient}<br />
                  {a.street}{a.number ? `, ${a.number}` : ""}{a.complement ? ` – ${a.complement}` : ""}<br />
                  {a.district ? `${a.district}, ` : ""}{a.city} – {a.region}<br />{a.postalCode}
                </address>
                <div className="mt-3"><AddressActions id={a.id} isDefault={a.isDefault} /></div>
              </li>
            ))}
          </ul>
        ) : <p className="rounded-[1.75rem] border border-dashed border-ink/15 p-8 text-center text-mute">{m.account.noAddresses}</p>}
      </section>
      <section className="rounded-[1.75rem] bg-metal p-6">
        <h3 className="mb-5 font-display text-lg font-semibold">{m.account.addAddress}</h3>
        <AddressForm />
      </section>
    </div>
  );
}
