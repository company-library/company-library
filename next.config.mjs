/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // E2Eビルド時は standalone を無効化する。
  // standalone 出力では `next start` は本来の起動方法ではなく
  // （正式には node .next/standalone/server.js）、静的アセットの配信が
  // 保証されずクライアントのハイドレーションが行われない場合がある。
  // E2E用ビルド(E2E_BUILD=true)では通常の本番サーバーとして `next start` が
  // 正しく動作するよう standalone を外す。
  output: process.env.E2E_BUILD === 'true' ? undefined : 'standalone',
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
