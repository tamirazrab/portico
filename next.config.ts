import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // PostCSS/Tailwind use native bindings; keep them on Node’s resolver so Turbopack
  // does not evaluate lightningcss/@tailwindcss/oxide in its sandbox (wrong arch / .node assets).
  serverExternalPackages: [
    "lightningcss",
    "@tailwindcss/node",
    "@tailwindcss/postcss",
    "@tailwindcss/oxide",
    "tailwindcss",
  ],
  turbopack: {
    resolveAlias: {
      "@tailwindcss/oxide": "./tools/tailwind-oxide.cjs",
    },
  },
  output: "standalone",
  // Root redirect removed - middleware handles language detection and routing
  // Middleware will redirect / to /[lang]/dashboard/workflows based on user's language
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    const prev = config.watchOptions?.ignored;
    const prevList = Array.isArray(prev)
      ? prev.filter((x): x is string => typeof x === "string" && x.length > 0)
      : typeof prev === "string" && prev.length > 0
        ? [prev]
        : [];
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [...prevList, "**/NodeBase/**"],
    };
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
