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

// プライベートIPアドレス・ループバック・リンクローカルのパターン（SSRF対策）
const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,
  /^fd[0-9a-f]{2}:/i,
]

const isPrivateIpOrLocalhost = (hostname: string): boolean => {
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(hostname))
}

/**
 * URLを検証し、安全な場合は正規化されたURLオブジェクトを返す
 * SSRF攻撃を防ぐため、HTTPSかつ許可されたホストのみを受け入れる
 * @param {string} url 検証するURL
 * @returns {URL | null} 有効なURLオブジェクト、無効な場合はnull
 */
const validateImageUrl = (url: string): URL | null => {
  try {
    const parsedUrl = new URL(url)

    // HTTPSのみ許可（fileやhttpなどのプロトコルを拒否）
    if (parsedUrl.protocol !== 'https:') return null

    const hostname = parsedUrl.hostname

    // プライベートIPアドレス・localhostを拒否（内部ネットワークへのアクセスを防止）
    if (isPrivateIpOrLocalhost(hostname)) return null

    // セキュリティの観点で、現在の実装ではワイルドカード（*.example.org）はサポートしない
    const allowedHosts = getAllowedHosts()
    if (!allowedHosts.includes(hostname)) return null

    return parsedUrl
  } catch {
    return null
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

  // SSRF攻撃を防ぐため、検証済みのURLオブジェクトを取得
  const validatedUrl = validateImageUrl(externalImageUrl)
  if (!validatedUrl) {
    console.warn(`不正な画像URL: ${externalImageUrl}`)
    return undefined
  }

  // 正規化された検証済みURLを使用してフェッチ（生の入力文字列を使わない）
  const imageFile = await fetch(validatedUrl.href).then((res) => res.blob())
  const blob = await put(`cover/${isbn}.jpg`, imageFile, {
    access: 'public',
    contentType: 'image/jpeg',
  })
  return blob.url
}
