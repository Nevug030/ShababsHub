/** @type {import('next').NextConfig} */
const nextConfig = {
  // No static export for Vercel - it supports dynamic routes
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    typedRoutes: true,
  },
}

module.exports = nextConfig
