import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prismaMock } from '../../../../test/__utils__/libs/prisma/singleton'
import { fetchBookInfo, getBooksWithMissingInfo, updateBooksInfo } from './actions'

vi.mock('@/libs/vercel/downloadAndPutImage', () => ({
  downloadAndPutImage: vi.fn().mockResolvedValue('https://blob.vercel-storage.com/mock-image.jpg'),
}))

describe('admin books actions', () => {
  const fetchMock = vi.fn()
  global.fetch = fetchMock

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchBookInfo', () => {
    const testIsbn = '9784000000000'

    it('Google Books APIから書籍情報を正常に取得する', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            items: [
              {
                volumeInfo: {
                  description: 'Google Booksの説明文',
                  imageLinks: { thumbnail: 'https://example.com/google-image.jpg' },
                },
              },
            ],
          }),
      } as Response)

      const result = await fetchBookInfo(testIsbn)

      expect(result).toEqual({
        description: 'Google Booksの説明文',
        imageUrl: 'https://example.com/google-image.jpg',
      })
      expect(fetchMock).toHaveBeenCalledTimes(1) // Google Books only (complete info)
    })

    it('Google Books APIで情報がない場合はOpenBD APIからフォールバック取得する', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                summary: {
                  title: 'OpenBDタイトル',
                  cover: 'https://openbd.example.com/cover.jpg',
                },
              },
            ]),
        } as Response)

      const result = await fetchBookInfo(testIsbn)

      expect(result).toEqual({
        description: undefined,
        imageUrl: 'https://openbd.example.com/cover.jpg',
      })
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('Google Books APIで部分的に情報がある場合はOpenBDで補完する', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              items: [
                {
                  volumeInfo: {
                    description: 'Google Booksの説明文',
                    // imageLinksなし
                  },
                },
              ],
            }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                summary: {
                  cover: 'https://openbd.example.com/cover.jpg',
                },
              },
            ]),
        } as Response)

      const result = await fetchBookInfo(testIsbn)

      expect(result).toEqual({
        description: 'Google Booksの説明文',
        imageUrl: 'https://openbd.example.com/cover.jpg',
      })
    })

    it('両方のAPIで情報が見つからない場合はnullを返す', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([null]),
        } as Response)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await fetchBookInfo(testIsbn)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '書籍情報取得エラー: 両方のAPIから情報を取得できませんでした (ISBN:',
        testIsbn,
        ')',
      )
    })

    it('Google Books APIでエラーが発生した場合はOpenBD APIからフォールバック取得する', async () => {
      fetchMock
        .mockRejectedValueOnce(new Error('Google Books Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                summary: {
                  title: 'OpenBDタイトル',
                  cover: 'https://openbd.example.com/cover.jpg',
                },
              },
            ]),
        } as Response)

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await fetchBookInfo(testIsbn)

      expect(result).toEqual({
        description: undefined,
        imageUrl: 'https://openbd.example.com/cover.jpg',
      })
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Google Books API error for ISBN',
        testIsbn,
        ':',
        expect.any(Error),
      )
      expect(fetchMock).toHaveBeenCalledTimes(2)

      consoleWarnSpy.mockRestore()
    })

    it('両方のAPIでエラーが発生した場合はnullを返す', async () => {
      fetchMock
        .mockRejectedValueOnce(new Error('Google Books Network error'))
        .mockRejectedValueOnce(new Error('OpenBD Network error'))

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await fetchBookInfo(testIsbn)

      expect(result).toBeNull()
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Google Books API error for ISBN',
        testIsbn,
        ':',
        expect.any(Error),
      )
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'OpenBD API error for ISBN',
        testIsbn,
        ':',
        expect.any(Error),
      )
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '書籍情報取得エラー: 両方のAPIから情報を取得できませんでした (ISBN:',
        testIsbn,
        ')',
      )
    })
  })

  describe('getBooksWithMissingInfo', () => {
    const mockBooks = [
      {
        id: 1,
        title: '書籍1',
        description: '',
        isbn: '1111111111111',
        imageUrl: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        _count: { registrationHistories: 5 },
      },
      {
        id: 2,
        title: '書籍2',
        description: '説明あり',
        isbn: '2222222222222',
        imageUrl: null,
        createdAt: new Date('2023-02-01'),
        updatedAt: new Date('2023-02-01'),
        _count: { registrationHistories: 3 },
      },
    ]

    it('デフォルトパラメータで不足情報のある書籍一覧を取得する', async () => {
      prismaMock.book.findMany.mockResolvedValue(mockBooks)

      const result = await getBooksWithMissingInfo()

      expect(result.success).toBe(true)
      expect(result.books).toEqual(mockBooks)
      expect(result.count).toBe(2)
      expect(prismaMock.book.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ OR: [{ description: '' }, { imageUrl: null }] }],
        },
        take: 50,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              registrationHistories: true,
            },
          },
        },
      })
    })

    it('カスタムパラメータで書籍一覧を取得する', async () => {
      prismaMock.book.findMany.mockResolvedValue(mockBooks)

      const result = await getBooksWithMissingInfo(10, 'description')

      expect(result.success).toBe(true)
      expect(prismaMock.book.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ description: '' }],
        },
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              registrationHistories: true,
            },
          },
        },
      })
    })

    it('画像のみフィルタで書籍一覧を取得する', async () => {
      prismaMock.book.findMany.mockResolvedValue(mockBooks)

      const result = await getBooksWithMissingInfo(20, 'image')

      expect(result.success).toBe(true)
      expect(result.books[0].title).toBe('書籍1')
      expect(result.books[1].title).toBe('書籍2')
      expect(prismaMock.book.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ imageUrl: null }],
        },
        take: 20,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              registrationHistories: true,
            },
          },
        },
      })
    })

    it('limitが100を超える場合は100に制限される', async () => {
      prismaMock.book.findMany.mockResolvedValue([])

      await getBooksWithMissingInfo(150)

      expect(prismaMock.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        }),
      )
    })

    it('作成日フィルタで書籍一覧を取得する', async () => {
      prismaMock.book.findMany.mockResolvedValue(mockBooks)

      const result = await getBooksWithMissingInfo(50, 'both', '2023-01-15', '2023-02-28')

      expect(result.success).toBe(true)
      expect(prismaMock.book.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { OR: [{ description: '' }, { imageUrl: null }] },
            {
              createdAt: {
                gte: new Date('2023-01-15'),
                lt: new Date('2023-03-01'),
              },
            },
          ],
        },
        take: 50,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              registrationHistories: true,
            },
          },
        },
      })
    })

    it('更新日フィルタで書籍一覧を取得する', async () => {
      prismaMock.book.findMany.mockResolvedValue(mockBooks)

      const result = await getBooksWithMissingInfo(
        50,
        'both',
        undefined,
        undefined,
        '2023-01-15',
        '2023-02-28',
      )

      expect(result.success).toBe(true)
      expect(prismaMock.book.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { OR: [{ description: '' }, { imageUrl: null }] },
            {
              updatedAt: {
                gte: new Date('2023-01-15'),
                lt: new Date('2023-03-01'),
              },
            },
          ],
        },
        take: 50,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              registrationHistories: true,
            },
          },
        },
      })
    })

    it('作成日と更新日の両方でフィルタした書籍一覧を取得する', async () => {
      prismaMock.book.findMany.mockResolvedValue(mockBooks)

      const result = await getBooksWithMissingInfo(
        50,
        'both',
        '2023-01-01',
        '2023-01-31',
        '2023-02-01',
        '2023-02-28',
      )

      expect(result.success).toBe(true)
      expect(prismaMock.book.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { OR: [{ description: '' }, { imageUrl: null }] },
            {
              createdAt: {
                gte: new Date('2023-01-01'),
                lt: new Date('2023-02-01'),
              },
            },
            {
              updatedAt: {
                gte: new Date('2023-02-01'),
                lt: new Date('2023-03-01'),
              },
            },
          ],
        },
        take: 50,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              registrationHistories: true,
            },
          },
        },
      })
    })

    it('無効な日付フォーマットは無視される', async () => {
      prismaMock.book.findMany.mockResolvedValue(mockBooks)

      const result = await getBooksWithMissingInfo(
        50,
        'both',
        'invalid-date',
        '2023-12-32',
        'not-a-date',
        '2023-13-01',
      )

      expect(result.success).toBe(true)
      expect(prismaMock.book.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ OR: [{ description: '' }, { imageUrl: null }] }],
        },
        take: 50,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              registrationHistories: true,
            },
          },
        },
      })
    })

    it('エラーが発生した場合', async () => {
      prismaMock.book.findMany.mockRejectedValue(new Error('データベースエラー'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await getBooksWithMissingInfo()

      expect(result.success).toBe(false)
      expect(result.message).toBe('書籍一覧の取得に失敗しました')
      expect(result.books).toEqual([])
      expect(result.count).toBe(0)
      expect(consoleSpy).toHaveBeenCalledWith('書籍一覧取得エラー:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('updateSelectedBooksInfo', () => {
    const mockBooks = [
      {
        id: 1,
        title: 'テスト書籍1',
        description: '',
        isbn: '9784000000001',
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: 'テスト書籍2',
        description: '',
        isbn: '9784000000002',
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    it('指定されたbookIdsの書籍を更新する', async () => {
      prismaMock.book.findMany.mockResolvedValue(mockBooks)
      prismaMock.book.update
        .mockResolvedValueOnce({
          ...mockBooks[0],
          description: '更新された説明文1',
          imageUrl: 'https://blob.vercel-storage.com/mock-image.jpg',
        })
        .mockResolvedValueOnce({
          ...mockBooks[1],
          description: '更新された説明文2',
          imageUrl: 'https://blob.vercel-storage.com/mock-image.jpg',
        })

      fetchMock
        // 書籍1: Google Books API（完全な情報があるのでOpenBDは呼ばれない）
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              items: [
                {
                  volumeInfo: {
                    description: '更新された説明文1',
                    imageLinks: { thumbnail: 'https://example.com/image1.jpg' },
                  },
                },
              ],
            }),
        } as Response)
        // 書籍2: Google Books API（完全な情報があるのでOpenBDは呼ばれない）
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              items: [
                {
                  volumeInfo: {
                    description: '更新された説明文2',
                    imageLinks: { thumbnail: 'https://example.com/image2.jpg' },
                  },
                },
              ],
            }),
        } as Response)

      const result = await updateBooksInfo({ bookIds: [1, 2] })

      expect(result.success).toBe(true)
      expect(result.updatedIsbns.length).toBe(2)
      expect(prismaMock.book.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: [1, 2],
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              registrationHistories: true,
            },
          },
        },
      })
    })

    it('書籍が見つからない場合', async () => {
      prismaMock.book.findMany.mockResolvedValue([])

      const result = await updateBooksInfo({ bookIds: [999] })

      expect(result.success).toBe(true)
      expect(result.message).toBe('更新対象の書籍が見つかりませんでした')
      expect(result.updatedIsbns.length).toBe(0)
    })
  })
})
