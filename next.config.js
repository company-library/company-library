/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      { hostname: 'books.google.com' },
      { hostname: 's.gravatar.com' },
      { hostname: 'picsum.photos' },
    ],
  },
}

module.exports = nextConfig
