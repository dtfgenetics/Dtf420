import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
};

export default nextConfig;
