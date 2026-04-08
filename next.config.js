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
};

module.exports = nextConfig;
