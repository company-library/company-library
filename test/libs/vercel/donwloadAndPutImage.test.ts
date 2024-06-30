import { downloadAndPutImage } from '@/libs/vercel/downloadAndPutImage'

describe('downloadAndPutImage function', () => {
  const { putMock } = vi.hoisted(() => {
    return { putMock: vi.fn() }
  })
  vi.mock('@vercel/blob', () => ({
    put: (...args: any[]) => putMock(...args),
  }))

  beforeEach(() => {
    putMock.mockResolvedValue({ url: 'https://example.com/cover/1234567890.jpg' })
  })

  it('ファイルをアップロードした場合、URLを消す', async () => {
    const externalImageUrl = 'https://example.com/image.jpg'
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
  })
})
