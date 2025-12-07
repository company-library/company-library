/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingIncludes: {
    '/*': [
      './src/generated/prisma/**/*',
      './node_modules/@prisma/client/**/*.node',
      './node_modules/.prisma/client/**/*.node',
    ],
  },
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': [
        './src/generated/prisma/**/*',
        './node_modules/@prisma/client/**/*.node',
        './node_modules/.prisma/client/**/*.node',
      ],
    },
  },
  images: {
    remotePatterns: [
      { hostname: 'books.google.com' },
      { hostname: 'gravatar.com' },
      { hostname: 'picsum.photos' },
      { hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  typedRoutes: true,
}

export default nextConfig
