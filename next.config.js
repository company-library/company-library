/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['books.google.com', 's.gravatar.com', 'picsum.photos'],
  },
}

module.exports = nextConfig
