import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components fica desligado: o site é fortemente dinâmico (sessão, carrinho e região por cookie).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: { bodySizeLimit: "25mb" },
  },
};

export default nextConfig;
