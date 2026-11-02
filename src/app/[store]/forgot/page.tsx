import type { Metadata } from "next";
import Link from "next/link";
import { resolveStore } from "@/lib/request";
import { languageAlternates } from "@/lib/alternates";
import { href } from "@/lib/stores";
import { AuthShell } from "@/components/auth-shell";
import { ForgotForm } from "@/components/auth-forms";

export async function generateMetadata({ params }: PageProps<"/[store]/forgot">): Promise<Metadata> {
  const { store, m } = await resolveStore(params);
  return { title: m.auth.forgotTitle, robots: { index: false }, alternates: await languageAlternates(store, ["forgot"]) };
}

export default async function ForgotPage({ params }: PageProps<"/[store]/forgot">) {
  const { store, m } = await resolveStore(params);
  return (
    <AuthShell store={store} title={m.auth.forgotTitle} subtitle={m.auth.forgotSubtitle}
      footer={<Link href={href(store, "login")} className="link">{m.common.back}</Link>}>
      <ForgotForm />
    </AuthShell>
  );
}
