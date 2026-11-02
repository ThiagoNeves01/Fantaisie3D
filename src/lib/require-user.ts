import "server-only";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "./auth";
import { href, type StoreKey } from "./stores";

/** Exige login; caso contrário redireciona para "Entrar" e volta à página atual depois. */
export async function requireUser(store: StoreKey) {
  const user = await getCurrentUser();
  if (!user) {
    const path = (await headers()).get("x-f3d-path") ?? href(store, "account");
    redirect(`${href(store, "login")}?next=${encodeURIComponent(path)}`);
  }
  return user;
}
