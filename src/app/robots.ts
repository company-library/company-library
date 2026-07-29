import type { MetadataRoute } from 'next'

// 社内向けシステムのため、検索エンジンによるクローリングを全面的に禁止する
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  }
}
