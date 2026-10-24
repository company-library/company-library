import { downloadAndPutImage } from '@/libs/vercel/downloadAndPutImage'

describe('downloadAndPutImage function', () => {
  const { putMock } = vi.hoisted(() => {
    return { putMock: vi.fn() }
  })
  vi.mock('@vercel/blob', () => ({
    put: (...args: unknown[]) => putMock(...args),
  }))
  vi.mock('../../../next.config.mjs', () => ({
    default: {
      images: {
        remotePatterns: [{ hostname: '*.example.org' }, { hostname: 'example.net' }],
      },
    },
  }))

  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

  beforeEach(() => {
    putMock.mockResolvedValue({ url: 'https://example.com/cover/1234567890.jpg' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('許可されたホストからの画像URLでファイルをアップロードした場合、URLを返す', async () => {
    const externalImageUrl = 'https://example.net/image.jpg'
    const isbn = '1234567890'
    const imageFile = new Blob()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: () => imageFile }))

    const result = await downloadAndPutImage(externalImageUrl, isbn)

    expect(result).toBe(`https://example.com/cover/${isbn}.jpg`)
    expect(putMock).toBeCalledWith(`cover/${isbn}.jpg`, imageFile, {
      access: 'public',
      contentType: 'image/jpeg',
    })
  })

  it('画像の取得に失敗した場合、アップロードせずにundefinedを返す', async () => {
    const externalImageUrl = 'https://example.net/image.jpg'
    const isbn = '1234567890'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))

    const result = await downloadAndPutImage(externalImageUrl, isbn)

    expect(result).toBeUndefined()
    expect(putMock).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `画像の取得に失敗しました: ${externalImageUrl} (status: 404)`,
    )
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
    // 許可されるのはドメイン名が完全に一致するもののみであり、サブドメインがある場合は拒否される
    const externalImageUrl = 'https://invalid.example.net/image.jpg'
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

  it('HTTPSでないURLは拒否される', async () => {
    const externalImageUrl = 'http://example.net/image.jpg'
    const isbn = '1234567890'

    const result = await downloadAndPutImage(externalImageUrl, isbn)

    expect(result).toBeUndefined()
    expect(putMock).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalledWith(`不正な画像URL: ${externalImageUrl}`)
  })

  it('プライベートIPアドレス（192.168.x.x）のURLは拒否される', async () => {
    const externalImageUrl = 'https://192.168.1.1/image.jpg'
    const isbn = '1234567890'

    const result = await downloadAndPutImage(externalImageUrl, isbn)

    expect(result).toBeUndefined()
    expect(putMock).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalledWith(`不正な画像URL: ${externalImageUrl}`)
  })

  it('ループバックアドレス（127.0.0.1）のURLは拒否される', async () => {
    const externalImageUrl = 'https://127.0.0.1/image.jpg'
    const isbn = '1234567890'

    const result = await downloadAndPutImage(externalImageUrl, isbn)

    expect(result).toBeUndefined()
    expect(putMock).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalledWith(`不正な画像URL: ${externalImageUrl}`)
  })

  it('リンクローカルアドレス（169.254.169.254）のURLは拒否される', async () => {
    const externalImageUrl = 'https://169.254.169.254/latest/meta-data/'
    const isbn = '1234567890'

    const result = await downloadAndPutImage(externalImageUrl, isbn)

    expect(result).toBeUndefined()
    expect(putMock).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalledWith(`不正な画像URL: ${externalImageUrl}`)
  })

  it('localhostのURLは拒否される', async () => {
    const externalImageUrl = 'https://localhost/image.jpg'
    const isbn = '1234567890'

    const result = await downloadAndPutImage(externalImageUrl, isbn)

    expect(result).toBeUndefined()
    expect(putMock).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalledWith(`不正な画像URL: ${externalImageUrl}`)
  })

  it('IPv6ループバックアドレス（[::1]）のURLはブラケット付きでも拒否される', async () => {
    const externalImageUrl = 'https://[::1]/image.jpg'
    const isbn = '1234567890'

    const result = await downloadAndPutImage(externalImageUrl, isbn)

    expect(result).toBeUndefined()
    expect(putMock).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalledWith(`不正な画像URL: ${externalImageUrl}`)
  })

  it('IPv6リンクローカルアドレス（[fe80::1]）のURLは拒否される', async () => {
    const externalImageUrl = 'https://[fe80::1]/image.jpg'
    const isbn = '1234567890'

    const result = await downloadAndPutImage(externalImageUrl, isbn)

    expect(result).toBeUndefined()
    expect(putMock).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalledWith(`不正な画像URL: ${externalImageUrl}`)
  })

  it('0.0.0.0/8範囲のIPアドレスのURLは拒否される', async () => {
    const externalImageUrl = 'https://0.0.0.1/image.jpg'
    const isbn = '1234567890'

    const result = await downloadAndPutImage(externalImageUrl, isbn)

    expect(result).toBeUndefined()
    expect(putMock).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalledWith(`不正な画像URL: ${externalImageUrl}`)
  })
})
