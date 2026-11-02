import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { resolveStore } from "@/lib/request";
import { getCurrentUser } from "@/lib/auth";
import { languageAlternates } from "@/lib/alternates";
import { href } from "@/lib/stores";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/auth-forms";

export async function generateMetadata({ params }: PageProps<"/[store]/register">): Promise<Metadata> {
  const { store, m } = await resolveStore(params);
  return { title: m.auth.registerTitle, robots: { index: false }, alternates: await languageAlternates(store, ["register"]) };
}

export default async function RegisterPage({ params }: PageProps<"/[store]/register">) {
  const { store, m } = await resolveStore(params);
  if (await getCurrentUser()) redirect(href(store, "account"));
  return (
    <AuthShell store={store} title={m.auth.registerTitle} subtitle={m.auth.registerSubtitle}
      footer={<p>{m.auth.hasAccount} <Link href={href(store, "login")} className="link">{m.auth.submitLogin}</Link></p>}>
      <RegisterForm />
    </AuthShell>
  );
}
