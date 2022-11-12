/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputStandalone: true,
  },
  images: {
    domains: ['books.google.com', 's.gravatar.com'],
  },
}

module.exports = nextConfig
