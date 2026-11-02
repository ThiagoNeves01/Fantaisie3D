import type { Metadata } from "next";
import { resolveStore } from "@/lib/request";
import { requireUser } from "@/lib/require-user";
import { PasswordForm, ProfileForm } from "@/components/account-forms";

export async function generateMetadata({ params }: PageProps<"/[store]/account/profile">): Promise<Metadata> {
  const { m } = await resolveStore(params);
  return { title: m.account.profile, robots: { index: false } };
}

export default async function ProfilePage({ params }: PageProps<"/[store]/account/profile">) {
  const { store, m } = await resolveStore(params);
  const user = await requireUser(store);
  return (
    <div className="grid gap-10 xl:grid-cols-2">
      <section>
        <h2 className="mb-5 font-display text-2xl font-semibold">{m.account.profile}</h2>
        <ProfileForm name={user.name} phone={user.phone} email={user.email} newsletter={user.newsletter} />
      </section>
      <section>
        <h2 className="mb-5 font-display text-2xl font-semibold">{m.account.changePassword}</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
