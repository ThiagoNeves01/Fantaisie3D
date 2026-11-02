import { NextResponse, type NextRequest } from "next/server";
import { listProducts } from "@/lib/catalog";
import { isStoreKey, href } from "@/lib/stores";
import { formatMoney } from "@/lib/format";

/** Sugestões automáticas de busca (até 6 produtos da loja/região atual). */
export async function GET(req: NextRequest) {
  const store = req.nextUrl.searchParams.get("store");
  const q = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 60);
  if (!isStoreKey(store) || q.trim().length < 2) return NextResponse.json({ items: [] });
  const items = await listProducts(store, { q, limit: 6 });
  return NextResponse.json({
    items: items.map((p) => ({
      name: p.name, href: href(store, "product", p.slug), image: p.image,
      price: formatMoney(p.salePrice ?? p.price, store),
    })),
  }, { headers: { "Cache-Control": "private, max-age=30" } });
}
