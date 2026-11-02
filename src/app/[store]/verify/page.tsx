import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { resolveStore } from "@/lib/request";
import { consumeAuthToken } from "@/lib/auth";
import { href } from "@/lib/stores";
import { AuthShell } from "@/components/auth-shell";

export async function generateMetadata({ params }: PageProps<"/[store]/verify">): Promise<Metadata> {
  const { m } = await resolveStore(params);
  return { title: m.auth.verifyTitle, robots: { index: false } };
}

export default async function VerifyPage({ params, searchParams }: PageProps<"/[store]/verify">) {
  const { store, m } = await resolveStore(params);
  const token = (await searchParams).token;
  let ok = false;
  if (typeof token === "string" && token.length > 20) {
    const row = await consumeAuthToken(token, "EMAIL_VERIFICATION");
    if (row) {
      await db.update(s.users).set({ emailVerifiedAt: new Date() }).where(eq(s.users.id, row.userId));
      ok = true;
    }
  }
  return (
    <AuthShell store={store} title={m.auth.verifyTitle}>
      <p role="status" data-testid="verify-result" className={`rounded-2xl px-4 py-3 text-sm ${ok ? "bg-teal/10 text-teal-ink" : "bg-danger/10 text-danger"}`}>
        {ok ? m.auth.verifyDone : m.auth.tokenInvalid}
      </p>
      <Link href={href(store, "account")} className="btn-ink mt-6">{m.nav.account}</Link>
    </AuthShell>
  );
}
