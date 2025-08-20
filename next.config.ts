import type { NextConfig } from "next";
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const apiBase = RAW_API_URL.replace(/\/+$/, "");

if (!apiBase) {
  console.warn(
    "[next.config] NEXT_PUBLIC_API_URL is not set. /api/* rewrites will be disabled."
  );
}

const destBase = apiBase
  ? apiBase.endsWith("/api")
    ? apiBase
    : `${apiBase}/api`
  : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",

  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },

  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  images: {
    domains: [
      "images.unsplash.com",
      "placehold.co",
      "localhost",
      "res.cloudinary.com",
    ],
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5228",
        pathname: "/**",
      },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },

  async rewrites() {
    if (!destBase) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${destBase}/:path*`,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
