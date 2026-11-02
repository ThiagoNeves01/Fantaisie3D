import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, schema as s } from "@/db";
import { formatDate } from "@/lib/format";
import { STORES, type StoreKey } from "@/lib/stores";
import { fmt, type Messages } from "@/i18n";

export async function getPage(store: StoreKey, key: string) {
  return db.query.pages.findFirst({ where: and(eq(s.pages.key, key), eq(s.pages.locale, STORES[store].locale)) });
}

/** Renderiza markdown simples (## títulos, parágrafos, listas "- ") sem HTML bruto. */
function Markdown({ body }: { body: string }) {
  const blocks = body.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => l.startsWith("- "))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>;
        if (lines[0].startsWith("## ")) {
          return (
            <div key={i}>
              <h2>{lines[0].slice(3)}</h2>
              {lines.slice(1).join(" ").trim() && <p>{lines.slice(1).join(" ")}</p>}
            </div>
          );
        }
        return <p key={i}>{lines.join(" ")}</p>;
      })}
    </>
  );
}

export async function ContentPage({ store, m, pageKey, legal = false }: { store: StoreKey; m: Messages; pageKey: string; legal?: boolean }) {
  const page = await getPage(store, pageKey);
  if (!page) notFound();
  return (
    <article className="on-light container-x py-14">
      <h1 className="max-w-3xl text-3xl font-semibold sm:text-[2.6rem]">{page.title}</h1>
      {legal && <p className="mt-3 text-sm text-mute">{fmt(m.pages.lastUpdated, { date: formatDate(page.updatedAt, store) })}</p>}
      {legal && <p className="mt-5 max-w-[68ch] rounded-2xl border border-dashed border-ink/20 px-4 py-3 text-xs text-mute">{m.pages.legalReview}</p>}
      <div className="prose-f3d mt-8"><Markdown body={page.body} /></div>
    </article>
  );
}
