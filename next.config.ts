import type { NextConfig } from "next";

const staticOverlay = process.env.DTF_STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(staticOverlay
    ? {
        output: "export" as const,
        trailingSlash: true,
      }
    : {
        async redirects() {
          return [
            {
              source: "/blog",
              destination: "/journal",
              permanent: true,
            },
            {
              source: "/blog/:path*",
              destination: "/journal",
              permanent: true,
            },
          ];
        },
      }),
};

export default nextConfig;
