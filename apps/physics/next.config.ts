import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@topcoaching/sim-core"],
  turbopack: {},
  experimental: {},
  outputFileTracingIncludes: {
    "/**": ["./src/challenges/**/*"],
  },
  async headers() {
    const allowedOrigins = process.env.ALLOWED_PARENT_ORIGINS || "http://localhost:3000 https://topcoaching.vercel.app";
    const allowedAncestors = process.env.ALLOWED_FRAME_ANCESTORS || `'self' ${allowedOrigins}`;
    return [
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${allowedAncestors}`,
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${allowedAncestors}`,
          },
        ],
      },
      {
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
