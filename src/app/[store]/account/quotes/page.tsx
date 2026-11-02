import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, or } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { resolveStore } from "@/lib/request";
import { requireUser } from "@/lib/require-user";
import { formatDate, formatMoney } from "@/lib/format";
import { href, STORES, storeForLocale, type StoreKey } from "@/lib/stores";
import { fmt } from "@/i18n";

export async function generateMetadata({ params }: PageProps<"/[store]/account/quotes">): Promise<Metadata> {
  const { m } = await resolveStore(params);
  return { title: m.account.quotes, robots: { index: false } };
}

export default async function QuotesPage({ params }: PageProps<"/[store]/account/quotes">) {
  const { store, m } = await resolveStore(params);
  const user = await requireUser(store);
  // inclui solicitações feitas antes do login com o mesmo e-mail
  const quotes = await db.query.quoteRequests.findMany({
    where: or(eq(s.quoteRequests.userId, user.id), eq(s.quoteRequests.email, user.email)),
    orderBy: desc(s.quoteRequests.createdAt),
    with: { files: true },
  });
  const a = m.account;
  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">{a.quotes}</h2>
        <Link href={href(store, "custom")} className="btn-ghost btn-sm">{m.home.customCta}</Link>
      </div>
      {quotes.length ? (
        <ul className="space-y-4" data-testid="quotes-list">
          {quotes.map((q) => {
            const qs: StoreKey = q.market === STORES[store].market ? store : storeForLocale(q.locale);
            return (
              <li key={q.id} className="rounded-[1.75rem] border border-ink/8 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{fmt(a.quoteNumber, { number: q.number })}</h3>
                    <p className="text-sm text-mute">{formatDate(q.createdAt, store)} · {m.custom.productTypes[q.productType as keyof typeof m.custom.productTypes] ?? q.productType}</p>
                  </div>
                  <span className="rounded-full bg-metal px-3 py-1 text-sm font-medium">{a.quoteStatus[q.status]}</span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink/80">{q.description}</p>
                {q.files.length > 0 && <p className="mt-2 text-xs text-mute">{q.files.map((f) => f.filename).join(", ")}</p>}
                {q.proposalAmount != null && (
                  <div className="mt-4 rounded-2xl bg-teal/10 p-4 text-sm">
                    <p className="font-semibold">{a.proposal}: {formatMoney(q.proposalAmount, qs)}</p>
                    {q.proposalMessage && <p className="mt-1">{q.proposalMessage}</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : <p className="rounded-[1.75rem] border border-dashed border-ink/15 p-10 text-center text-mute">{a.noQuotes}</p>}
    </section>
  );
}
