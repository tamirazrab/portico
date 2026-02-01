import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Root redirect removed - middleware handles language detection and routing
  // Middleware will redirect / to /[lang]/dashboard/workflows based on user's language
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    // Exclude NodeBase directory from webpack
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        ...(Array.isArray(config.watchOptions?.ignored)
          ? config.watchOptions.ignored
          : [config.watchOptions?.ignored].filter(Boolean)),
        "**/NodeBase/**",
      ],
    };
    return config;
  },
};

export default nextConfig;
