import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { resolveStore } from "@/lib/request";
import { getCurrentUser } from "@/lib/auth";
import { languageAlternates } from "@/lib/alternates";
import { href } from "@/lib/stores";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";

export async function generateMetadata({ params }: PageProps<"/[store]/login">): Promise<Metadata> {
  const { store, m } = await resolveStore(params);
  return { title: m.auth.loginTitle, robots: { index: false }, alternates: await languageAlternates(store, ["login"]) };
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[store]/login">) {
  const { store, m } = await resolveStore(params);
  const sp = await searchParams;
  if (await getCurrentUser()) redirect(href(store, "account"));
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const notice = sp.reset ? m.auth.resetDone : sp.fav ? m.product.loginForFavorites : sp.loggedout ? m.auth.loggedOut : null;
  return (
    <AuthShell store={store} title={m.auth.loginTitle} subtitle={m.auth.loginSubtitle}
      footer={<>
        <p>{m.auth.noAccount} <Link href={href(store, "register")} className="link">{m.auth.submitRegister}</Link></p>
        <p className="mt-4 rounded-2xl bg-metal px-4 py-3 text-xs">{m.auth.socialTitle}: {m.auth.socialUnavailable}</p>
      </>}>
      {notice && <p role="status" className="mb-4 rounded-2xl bg-teal/10 px-4 py-3 text-sm text-teal-ink">{notice}</p>}
      <LoginForm next={next} />
    </AuthShell>
  );
}
