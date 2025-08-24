import { prismaMock } from '../../../../test/__utils__/libs/prisma/singleton'
import { getBooksWithMissingInfo, updateSingleBookInfo } from './actions'

global.fetch = vi.fn()
const mockFetch = fetch as ReturnType<typeof vi.fn>

describe('admin books actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateSingleBookInfo', () => {
    const mockBook = {
      id: 1,
      title: 'テスト書籍',
      description: '',
      isbn: '9784000000000',
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockUpdatedBook = {
      ...mockBook,
      description: '更新された説明文',
      imageUrl: 'https://example.com/updated-image.jpg',
    }

    it('書籍が見つからない場合はエラーを返す', async () => {
      prismaMock.book.findUnique.mockResolvedValue(null)

      const result = await updateSingleBookInfo(999)

      expect(result.success).toBe(false)
      expect(result.message).toBe('書籍が見つかりません')
    })

    it('外部APIでエラーが発生した場合はエラーを返す', async () => {
      prismaMock.book.findUnique.mockResolvedValue(mockBook)
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await updateSingleBookInfo(1)

      expect(result.success).toBe(false)
      expect(result.message).toBe('外部APIから書籍情報を取得できませんでした')
    })

    it('説明文のみ更新する場合', async () => {
      prismaMock.book.findUnique.mockResolvedValue({
        ...mockBook,
        imageUrl: 'existing-image.jpg',
      })
      prismaMock.book.update.mockResolvedValue({
        ...mockBook,
        description: '新しい説明文',
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            items: [
              {
                volumeInfo: {
                  description: '新しい説明文',
                  imageLinks: { thumbnail: 'https://example.com/image.jpg' },
                },
              },
            ],
          }),
      } as Response)

      const result = await updateSingleBookInfo(1)

      expect(result.success).toBe(true)
      expect(result.message).toBe('書籍情報を更新しました')
      expect(result.updatedFields).toEqual(['description'])
      expect(prismaMock.book.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { description: '新しい説明文' },
      })
    })

    it('画像URLのみ更新する場合', async () => {
      prismaMock.book.findUnique.mockResolvedValue({
        ...mockBook,
        description: '既存の説明文',
      })
      prismaMock.book.update.mockResolvedValue({
        ...mockBook,
        imageUrl: 'https://example.com/image.jpg',
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            items: [
              {
                volumeInfo: {
                  description: '説明文',
                  imageLinks: { thumbnail: 'https://example.com/image.jpg' },
                },
              },
            ],
          }),
      } as Response)

      const result = await updateSingleBookInfo(1)

      expect(result.success).toBe(true)
      expect(result.updatedFields).toEqual(['imageUrl'])
      expect(prismaMock.book.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { imageUrl: 'https://example.com/image.jpg' },
      })
    })

    it('説明文と画像URLの両方を更新する場合', async () => {
      prismaMock.book.findUnique.mockResolvedValue(mockBook)
      prismaMock.book.update.mockResolvedValue(mockUpdatedBook)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            items: [
              {
                volumeInfo: {
                  description: '新しい説明文',
                  imageLinks: { thumbnail: 'https://example.com/image.jpg' },
                },
              },
            ],
          }),
      } as Response)

      const result = await updateSingleBookInfo(1)

      expect(result.success).toBe(true)
      expect(result.updatedFields).toContain('description')
      expect(result.updatedFields).toContain('imageUrl')
      expect(prismaMock.book.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          description: '新しい説明文',
          imageUrl: 'https://example.com/image.jpg',
        },
      })
    })

    it('更新する情報がない場合', async () => {
      prismaMock.book.findUnique.mockResolvedValue({
        ...mockBook,
        description: '既存の説明文',
        imageUrl: 'existing-image.jpg',
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            items: [
              {
                volumeInfo: {
                  description: '説明文',
                  imageLinks: { thumbnail: 'https://example.com/image.jpg' },
                },
              },
            ],
          }),
      } as Response)

      const result = await updateSingleBookInfo(1)

      expect(result.success).toBe(true)
      expect(result.message).toBe('更新する情報がありませんでした')
      expect(result.updatedFields).toEqual([])
      expect(prismaMock.book.update).not.toHaveBeenCalled()
    })

    it('OpenBD APIからフォールバック情報を取得する', async () => {
      prismaMock.book.findUnique.mockResolvedValue(mockBook)
      prismaMock.book.update.mockResolvedValue({
        ...mockBook,
        imageUrl: 'https://openbd.example.com/cover.jpg',
      })

      mockFetch
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

      const result = await updateSingleBookInfo(1)

      expect(result.success).toBe(true)
      expect(result.updatedFields).toEqual(['imageUrl'])
      expect(prismaMock.book.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { imageUrl: 'https://openbd.example.com/cover.jpg' },
      })
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
          AND: [
            { OR: [{ description: '' }, { imageUrl: null }] },
          ],
        },
        take: 50,
        orderBy: {
          createdAt: 'desc',
        },
      })
    })

    it('カスタムパラメータで書籍一覧を取得する', async () => {
      prismaMock.book.findMany.mockResolvedValue(mockBooks)

      const result = await getBooksWithMissingInfo(10, 'description')

      expect(result.success).toBe(true)
      expect(prismaMock.book.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { description: '' },
          ],
        },
        take: 10,
        orderBy: {
          createdAt: 'desc',
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
          AND: [
            { imageUrl: null },
          ],
        },
        take: 20,
        orderBy: {
          createdAt: 'desc',
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

      const result = await getBooksWithMissingInfo(
        50,
        'both',
        '2023-01-15',
        '2023-02-28',
      )

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
          AND: [
            { OR: [{ description: '' }, { imageUrl: null }] },
          ],
        },
        take: 50,
        orderBy: {
          createdAt: 'desc',
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
})
