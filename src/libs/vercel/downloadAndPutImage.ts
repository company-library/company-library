import { put } from '@vercel/blob'
import nextConfig from '../../../next.config.mjs'
import dns from 'node:dns'
import net from 'node:net'
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
 * 指定したIPアドレスがプライベートまたはループバックかどうかを判定
 */
const isPrivateOrLoopbackIp = (ip: string): boolean => {
  // IPv4
  if (net.isIPv4(ip)) {
    if (
      ip.startsWith('10.') || // 10.0.0.0/8
      ip.startsWith('127.') || // 127.0.0.0/8
      ip.startsWith('169.254.') || // 169.254.0.0/16
      ip.startsWith('172.') && (() => {
        const second = parseInt(ip.split('.')[1], 10)
        return second >= 16 && second <= 31 // 172.16.0.0/12
      })() ||
      ip.startsWith('192.168.') // 192.168.0.0/16
    ) {
      return true
    }
  }
  // IPv6
  if (net.isIPv6(ip)) {
    if (
      ip === '::1' || // loopback
      ip.startsWith('fc') || ip.startsWith('fd') // unique local address
    ) {
      return true
    }
  }
  return false
}

/**
 * URLが信頼できるホストからのものかを検証する（IPアドレスもチェック）
 * @param {string} url 検証するURL
 * @returns {Promise<boolean>} 信頼できるホストの場合true
 */
const isAllowedImageUrl = async (url: string): Promise<boolean> => {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname
    const allowedHosts = getAllowedHosts()

    // セキュリティの観点で、現在の実装ではワイルドカード（*.example.org）はサポートしない
    if (!allowedHosts.includes(hostname)) {
      return false
    }

    // ホスト名をIPアドレスに解決し、プライベート/ループバックでないことを確認
    const addresses = await dns.promises.lookup(hostname, { all: true })
    if (addresses.some(addr => isPrivateOrLoopbackIp(addr.address))) {
      return false
    }

    // ポート番号の制限（任意: 80, 443のみ許可したい場合は以下を有効化）
    // if (parsedUrl.port && parsedUrl.port !== '80' && parsedUrl.port !== '443') {
    //   return false
    // }

    return true
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

  // SSRF攻撃を防ぐため、信頼できるホストのみ許可（IPアドレスも検証）
  if (!(await isAllowedImageUrl(externalImageUrl))) {
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
