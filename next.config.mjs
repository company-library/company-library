/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      { hostname: 'books.google.com' },
      { hostname: 'gravatar.com' },
      { hostname: 'picsum.photos' },
      { hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
}

export default nextConfig
