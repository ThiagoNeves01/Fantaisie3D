import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_STORE, STORES, STORE_COOKIE, isStoreKey, parsePublicPath, toInternalSegments, type StoreKey,
} from "@/lib/stores";

const ONE_YEAR = 60 * 60 * 24 * 365;

function detectStore(req: NextRequest): StoreKey {
  const saved = req.cookies.get(STORE_COOKIE)?.value;
  if (isStoreKey(saved)) return saved;
  const country = req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry");
  const lang = (req.headers.get("accept-language") ?? "").toLowerCase();
  if (country === "CA") return lang.startsWith("fr") ? "ca-fr" : "ca-en";
  if (country === "BR") return "br";
  if (lang.startsWith("pt")) return "br";
  if (lang.startsWith("fr-ca")) return "ca-fr";
  if (lang.startsWith("en-ca")) return "ca-en";
  return DEFAULT_STORE;
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Raiz → loja salva / detectada
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = STORES[detectStore(req)].prefix;
    return NextResponse.redirect(url);
  }

  // Acesso direto à rota interna (/ca-en/...) → URL pública
  const first = pathname.split("/")[1];
  if (first === "ca-en" || first === "ca-fr") {
    const url = req.nextUrl.clone();
    url.pathname = STORES[first].prefix + pathname.slice(first.length + 1);
    return NextResponse.redirect(url, 308);
  }

  const parsed = parsePublicPath(pathname);
  if (!parsed) {
    // Caminho sem loja (ex.: /produtos) → prefixar com a loja detectada
    const url = req.nextUrl.clone();
    url.pathname = STORES[detectStore(req)].prefix + pathname;
    return NextResponse.redirect(url);
  }

  const { store, rest } = parsed;
  const internal = toInternalSegments(store, rest) ?? rest;
  const url = req.nextUrl.clone();
  url.pathname = "/" + [store, ...internal].join("/");
  url.search = search;

  const res = NextResponse.rewrite(url, {
    request: { headers: new Headers({ ...Object.fromEntries(req.headers), "x-f3d-path": pathname }) },
  });
  // Salva a escolha de país/idioma (persistente mesmo após fechar o navegador)
  if (req.cookies.get(STORE_COOKIE)?.value !== store) {
    res.cookies.set(STORE_COOKIE, store, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|brand|products|images|uploads|icon.png|apple-icon.png|favicon.ico|robots.txt|sitemap.xml|.*\\.\\w+$).*)"],
};
