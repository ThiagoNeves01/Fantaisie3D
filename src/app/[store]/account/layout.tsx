import { resolveStore } from "@/lib/request";
import { requireUser } from "@/lib/require-user";
import { fmt } from "@/i18n";
import { AccountNav } from "@/components/account-nav";

export default async function AccountLayout({ children, params }: LayoutProps<"/[store]/account">) {
  const { store, m } = await resolveStore(params);
  const user = await requireUser(store);
  return (
    <div className="on-light container-x py-10 sm:py-14">
      <p className="text-sm text-mute">{m.account.title}</p>
      <h1 className="mt-1 text-3xl font-semibold sm:text-[2.4rem]" data-testid="account-hello">{fmt(m.account.hello, { name: user.name.split(" ")[0] })}</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
