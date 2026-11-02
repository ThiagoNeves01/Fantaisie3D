import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { desc } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { resolveStore } from "@/lib/request";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { robots: { index: false } };

/** Caixa de saída de e-mails, apenas em desenvolvimento (sem provedor configurado). */
export default async function Outbox({ params }: PageProps<"/[store]/outbox">) {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEV_OUTBOX !== "true") notFound();
  const { store, m } = await resolveStore(params);
  const mails = await db.query.emailLog.findMany({ orderBy: desc(s.emailLog.createdAt), limit: 30 });
  return (
    <div className="container-x py-12">
      <h1 className="text-3xl font-semibold">{m.email.outboxTitle}</h1>
      <p className="mt-2 text-mute">{m.email.outboxText}</p>
      <ul className="mt-8 space-y-6" data-testid="outbox">
        {mails.map((e) => (
          <li key={e.id} className="overflow-hidden rounded-[1.75rem] border border-ink/10">
            <div className="flex flex-wrap justify-between gap-2 bg-metal px-5 py-3 text-sm">
              <span><strong>{e.subject}</strong> · {e.to} · {e.locale}</span>
              <span className="text-mute">{formatDate(e.createdAt, store, { dateStyle: "short", timeStyle: "short" })}</span>
            </div>
            <iframe srcDoc={e.html} title={e.subject} sandbox="" className="h-[26rem] w-full bg-white" />
          </li>
        ))}
      </ul>
    </div>
  );
}
