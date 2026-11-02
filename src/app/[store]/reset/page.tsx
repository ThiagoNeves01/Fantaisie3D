import type { Metadata } from "next";
import Link from "next/link";
import { resolveStore } from "@/lib/request";
import { href } from "@/lib/stores";
import { AuthShell } from "@/components/auth-shell";
import { ResetForm } from "@/components/auth-forms";

export async function generateMetadata({ params }: PageProps<"/[store]/reset">): Promise<Metadata> {
  const { m } = await resolveStore(params);
  return { title: m.auth.resetTitle, robots: { index: false } };
}

export default async function ResetPage({ params, searchParams }: PageProps<"/[store]/reset">) {
  const { store, m } = await resolveStore(params);
  const token = (await searchParams).token;
  return (
    <AuthShell store={store} title={m.auth.resetTitle}>
      {typeof token === "string" && token.length > 20 ? <ResetForm token={token} /> : (
        <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {m.auth.tokenInvalid} <Link href={href(store, "forgot")} className="underline">{m.auth.forgot}</Link>
        </p>
      )}
    </AuthShell>
  );
}
