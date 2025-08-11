import { put } from '@vercel/blob'
import nextConfig from '../../../next.config.mjs'

/**
 * Next.jsのremotePatternsから許可されたホスト名を取得
 */
const getAllowedHosts = (): string[] => {
  const remotePatterns = nextConfig.images?.remotePatterns || []
  return remotePatterns
    .map((pattern) => pattern.hostname)
    .filter((hostname): hostname is string => Boolean(hostname))
}

/**
 * URLが信頼できるホストからのものかを検証する
 * @param {string} url 検証するURL
 * @returns {boolean} 信頼できるホストの場合true
 */
const isAllowedImageUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname
    const allowedHosts = getAllowedHosts()

    // セキュリティの観点で、現在の実装ではワイルドカード（*.example.org）はサポートしない
    return allowedHosts.includes(hostname)
  } catch {
    return false
  }
}

/**
 * 画像をダウンロードしてVercel Blobにアップロードする
 * @param {string | undefined} externalImageUrl 外部サイトの画像URL
 * @param {string} isbn ISBN
 * @returns {Promise<string | undefined>}
 */
export const downloadAndPutImage = async (
  externalImageUrl: string | undefined,
  isbn: string,
): Promise<string | undefined> => {
  if (!externalImageUrl) {
    return undefined
  }

  // SSRF攻撃を防ぐため、信頼できるホストのみ許可
  if (!isAllowedImageUrl(externalImageUrl)) {
    console.warn(`不正な画像URL: ${externalImageUrl}`)
    return undefined
  }

  const imageFile = await fetch(externalImageUrl).then((res) => res.blob())
  const blob = await put(`cover/${isbn}.jpg`, imageFile, {
    access: 'public',
    contentType: 'image/jpeg',
  })
  return blob.url
}
