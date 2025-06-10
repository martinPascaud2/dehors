/** @type {import('next').NextConfig} */

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontendNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: false,
});

const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  images: {
    formats: ["image/webp", "image/avif"],
    domains: [process.env.NEXT_PUBLIC_DEHORS_URL],
  },
};

module.exports = withPWA(nextConfig);
