import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/mailer";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/*/conta", "/*/*/account", "/*/*/compte", "/*/carrinho", "/*/*/cart", "/*/*/panier", "/*/dev-emails", "/*/*/dev-emails"] }],
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
