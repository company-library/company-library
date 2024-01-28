/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      { hostname: 'books.google.com' },
      { hostname: 'gravatar.com' },
      { hostname: 'picsum.photos' },
    ],
  },
}

module.exports = nextConfig
