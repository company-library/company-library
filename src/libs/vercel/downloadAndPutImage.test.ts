import { downloadAndPutImage } from '@/libs/vercel/downloadAndPutImage'

// next.config.mjsをモック
vi.mock('../../../next.config.mjs', () => ({
  default: {
    images: {
      remotePatterns: [{ hostname: '*.example.org' }, { hostname: 'example.net' }],
    },
  },
}))

describe('downloadAndPutImage function', () => {
  const { putMock } = vi.hoisted(() => {
    return { putMock: vi.fn() }
  })
  vi.mock('@vercel/blob', () => ({
    put: (...args: unknown[]) => putMock(...args),
  }))

  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

  beforeEach(() => {
    putMock.mockResolvedValue({ url: 'https://example.com/cover/1234567890.jpg' })
  })

  it('許可されたホストからの画像URLでファイルをアップロードした場合、URLを返す', async () => {
    const externalImageUrl = 'https://example.net/image.jpg'
    const isbn = '1234567890'
    const imageFile = new Blob()
    global.fetch = vi.fn().mockResolvedValue({ blob: () => imageFile })

    const result = await downloadAndPutImage(externalImageUrl, isbn)

    expect(result).toBe(`https://example.com/cover/${isbn}.jpg`)
    expect(putMock).toBeCalledWith(`cover/${isbn}.jpg`, imageFile, {
      access: 'public',
      contentType: 'image/jpeg',
    })
  })

  it('externalImageUrlがundefinedの場合、undefinedを返す', async () => {
    const externalImageUrl = undefined
    const isbn = '1234567890'

    const result = await downloadAndPutImage(externalImageUrl, isbn)

    expect(result).toBeUndefined()
    expect(putMock).not.toHaveBeenCalled()
    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('許可されていないホストからの画像URLは拒否される', async () => {
    const externalImageUrl = 'https://example.jp/image.jpg'
    const isbn = '1234567890'

    const result = await downloadAndPutImage(externalImageUrl, isbn)

    expect(result).toBeUndefined()
    expect(putMock).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalledWith(`不正な画像URL: ${externalImageUrl}`)
  })

  it('ワイルドカードのホストからの画像URLは拒否される', async () => {
    const externalImageUrl = 'https://test.example.org/image.jpg'
    const isbn = '1234567890'

    const result = await downloadAndPutImage(externalImageUrl, isbn)

    expect(result).toBeUndefined()
    expect(putMock).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalledWith(`不正な画像URL: ${externalImageUrl}`)
  })
})
