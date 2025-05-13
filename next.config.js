/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontendNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: isDev,
  debug: false,
});

const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  images: {
    formats: ["image/webp", "image/avif"],
    domains: [process.env.NEXT_PUBLIC_DEHORS_URL],
  },
  devIndicators: false,
};

module.exports = withPWA(nextConfig);
