/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingIncludes: {
    "/api/stripe/redeliver": ["./public/fonts/**/*"],
    "/api/admin/digital-purchases": ["./public/fonts/**/*"],
    "/api/webhooks/stripe": ["./public/fonts/**/*"],
  },
  headers: async () => [
    {
      source: "/writers/:slug",
      headers: [
        { key: "Cache-Control", value: "no-store, must-revalidate" },
        { key: "CDN-Cache-Control", value: "no-store" },
        { key: "Vercel-CDN-Cache-Control", value: "no-store" },
      ],
    },
  ],
};

module.exports = nextConfig;
