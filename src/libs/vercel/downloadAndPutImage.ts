import { put } from '@vercel/blob'

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

  const imageFile = await fetch(externalImageUrl).then((res) => res.blob())
  const blob = await put(`cover/${isbn}.jpg`, imageFile, {
    access: 'public',
    contentType: 'image/jpeg',
  })
  return blob.url
}
