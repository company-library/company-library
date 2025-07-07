import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { expect } from 'vitest'
import BookDetail from '@/app/books/[id]/bookDetail'
import { bookWithoutImage, lendableBook } from '../../../__utils__/data/book'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'

describe('BookDetail component', async () => {
  const userId = 2

  const book = lendableBook
  const bookDetail = {
    title: book.title,
    imageUrl: book.imageUrl,
    lendingHistories: book.lendingHistories,
    _count: {
      registrationHistories: book.registrationHistories.length,
      reservations: book.reservations.length,
    },
  }
  const prismaBookMock = prismaMock.book.findUnique

  vi.mock('@/app/books/[id]/lendButton', () => ({
    default: (...args: { disabled: boolean }[]) => {
      return (
        <button disabled={args[0].disabled} type="button">
          借りる
        </button>
      )
    },
  }))

  vi.mock('@/app/books/[id]/returnButton', () => ({
    default: (...args: { disabled: boolean }[]) => {
      return (
        <button disabled={args[0].disabled} type="button">
          返却する
        </button>
      )
    },
  }))

  beforeEach(() => {
    // @ts-ignore
    prismaBookMock.mockResolvedValue(bookDetail)
  })

  it('本の詳細情報と操作ボタンが表示される', async () => {
    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByAltText(book.title)).toBeInTheDocument()
    expect(screen.getByAltText(book.title)).toHaveAttribute(
      'src',
      expect.stringContaining(encodeURIComponent(book.imageUrl)),
    )
    expect(screen.getByText(book.title)).toBeInTheDocument()
    expect(screen.getByText(`${2}冊貸し出し可能`)).toBeInTheDocument()
    expect(screen.getByText(`所蔵数: ${2}冊`)).toBeInTheDocument()
    expect(screen.getByText(`予約数: ${1}件`)).toBeInTheDocument()

    expect(screen.getByRole('button', { name: '借りる' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '返却する' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '感想を書く' })).toBeInTheDocument()
  })

  it('本の書影が無い場合はno_imageが表示される', async () => {
    // @ts-ignore
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      imageUrl: bookWithoutImage.imageUrl,
    })

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByAltText(book.title)).toBeInTheDocument()
    expect(screen.getByAltText(book.title)).toHaveAttribute(
      'src',
      expect.stringContaining(encodeURIComponent('/no_image.jpg')),
    )
  })

  it('貸し出し可能数は、 登録履歴数 - 未返却の貸出履歴数 である', async () => {
    const registrationHistoriesCount = 23
    const lendingHistoriesCount = 17
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      lendingHistories: [...Array(lendingHistoriesCount)].map((_, i) => i),
      _count: {
        registrationHistories: registrationHistoriesCount,
      },
    })

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(
      await screen.findByText(
        `${registrationHistoriesCount - lendingHistoriesCount}冊貸し出し可能`,
      ),
    ).toBeInTheDocument()
  })

  it('所蔵数は、 登録履歴数 である', async () => {
    const registrationHistoriesCount = 23
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      _count: {
        registrationHistories: registrationHistoriesCount,
      },
    })

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText(`所蔵数: ${registrationHistoriesCount}冊`)).toBeInTheDocument()
  })

  it('予約数は、 予約履歴数 である', async () => {
    const reservationsCount = 17
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      _count: {
        reservations: reservationsCount,
      },
    })

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText(`予約数: ${reservationsCount}件`)).toBeInTheDocument()
  })

  it('借りるボタンは、貸し出し可能数が0冊の場合、無効である', async () => {
    const registrationHistoriesCount = 23
    const lendingHistories = [...Array(registrationHistoriesCount)].map((_, i) => ({
      id: i + 1,
      userId: 0,
    }))
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      lendingHistories: lendingHistories,
      _count: {
        registrationHistories: registrationHistoriesCount,
      },
    })

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText(`${0}冊貸し出し可能`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '借りる' })).toBeDisabled()
  })

  it('借りるボタンは、借用中の場合、無効である', async () => {
    // 借りている
    const registrationHistoriesCount = 10
    const lendingHistories = [...Array(registrationHistoriesCount - 2)].map((_, i) => ({
      id: i + 1,
      userId: 0,
    }))
    const userLendingHistory = { userId: userId }
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      lendingHistories: [...lendingHistories, userLendingHistory],
      _count: {
        registrationHistories: registrationHistoriesCount,
      },
    })

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText(`${1}冊貸し出し可能`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '借りる' })).toBeDisabled()
  })

  it('借りるボタンは、貸し出し可能数が1冊以上 かつ 借用中ではない 場合、有効である', async () => {
    const registrationHistoriesCount = 56
    const lendingHistories = [...Array(registrationHistoriesCount - 1)].map((_, i) => ({
      id: i + 1,
      userId: 0,
    }))
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      lendingHistories: lendingHistories,
      _count: {
        registrationHistories: registrationHistoriesCount,
      },
    })

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText(`${1}冊貸し出し可能`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '借りる' })).toBeEnabled()
  })

  it('返却するボタンは、借用中の場合、有効である', async () => {
    // 借りている
    const registrationHistoriesCount = 5
    const lendingHistories = [...Array(registrationHistoriesCount - 1)].map((_, i) => ({
      id: i + 1,
      userId: 0,
    }))
    const userLendingHistory = { userId: userId }
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      lendingHistories: [...lendingHistories, userLendingHistory],
      _count: {
        registrationHistories: registrationHistoriesCount,
      },
    })

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByRole('button', { name: '返却する' })).toBeEnabled()
  })

  it('返却するボタンは、借用中ではない場合、無効である', async () => {
    // 借りている
    const registrationHistoriesCount = 8
    const lendingHistories = [...Array(registrationHistoriesCount)].map((_, i) => ({
      id: i + 1,
      userId: 0,
    }))
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      lendingHistories: [...lendingHistories],
      _count: {
        registrationHistories: registrationHistoriesCount,
      },
    })

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByRole('button', { name: '返却する' })).toBeDisabled()
  })

  it('本の取得時にエラーが発生した場合、エラーメッセージが表示される', async () => {
    const expectedError = new Error('DBエラー')
    prismaBookMock.mockRejectedValue(expectedError)
    console.error = vi.fn()

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(
      await screen.findByText('本の取得に失敗しました。再読み込みしてみてください。'),
    ).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectedError)
  })

  it('対象のIDで本が取得できなかった場合、エラーメッセージが表示される', async () => {
    prismaBookMock.mockResolvedValue(null)
    console.error = vi.fn()

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    expect(
      await screen.findByText('本の取得に失敗しました。再読み込みしてみてください。'),
    ).toBeInTheDocument()
    expect(console.error).toBeCalledWith('対象のIDの本は存在しません。bookId:', book.id)
  })

  it('全体情報が保管場所別在庫状況の上に表示される', async () => {
    const mockBookWithLocation = {
      ...bookDetail,
      registrationHistories: [
        {
          locationId: 1,
          location: { id: 1, name: '本社' },
        },
        {
          locationId: 2,
          location: { id: 2, name: '支社' },
        },
      ],
      _count: {
        reservations: 1,
      },
    }
    // @ts-ignore
    prismaBookMock.mockResolvedValue(mockBookWithLocation)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)

    const allElements = screen.getAllByText(/全体|保管場所別在庫状況/)
    const globalInfo = screen.getByText('全体')
    const locationLabel = screen.getByText('保管場所別在庫状況')

    // 全体情報が保管場所別在庫状況より前に表示されていることを確認
    const globalPosition = Array.from(document.body.querySelectorAll('*')).indexOf(
      globalInfo.closest('div')!,
    )
    const locationPosition = Array.from(document.body.querySelectorAll('*')).indexOf(
      locationLabel.closest('h3')!,
    )

    expect(globalPosition).toBeLessThan(locationPosition)
  })

  it('保管場所がある場合、保管場所別在庫状況が表示される', async () => {
    const mockBookWithLocation = {
      ...bookDetail,
      registrationHistories: [
        {
          locationId: 1,
          location: { id: 1, name: '本社' },
        },
        {
          locationId: 2,
          location: { id: 2, name: '支社' },
        },
      ],
      _count: {
        reservations: 1,
      },
    }
    // @ts-ignore
    prismaBookMock.mockResolvedValue(mockBookWithLocation)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    expect(await screen.findByText('保管場所別在庫状況')).toBeInTheDocument()
    expect(screen.getByText('本社')).toBeInTheDocument()
    expect(screen.getByText('支社')).toBeInTheDocument()
  })

  it('保管場所がない場合、保管場所別在庫状況のラベルが表示されない', async () => {
    const mockBookWithoutLocation = {
      ...bookDetail,
      registrationHistories: [],
      _count: {
        reservations: 1,
      },
    }
    // @ts-ignore
    prismaBookMock.mockResolvedValue(mockBookWithoutLocation)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)
    expect(screen.queryByText('保管場所別在庫状況')).not.toBeInTheDocument()
  })

  it('保管場所ごとの在庫情報が正しく計算・表示される', async () => {
    const mockBookWithLocation = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: '本社' } },
        { locationId: 1, location: { id: 1, name: '本社' } },
        { locationId: 1, location: { id: 1, name: '本社' } },
        { locationId: 2, location: { id: 2, name: '支社' } },
        { locationId: 2, location: { id: 2, name: '支社' } },
      ],
      lendingHistories: [
        { id: 1, userId: 10 },
        { id: 2, userId: 11 },
      ],
      _count: {
        reservations: 1,
      },
    }
    // @ts-ignore
    prismaBookMock.mockResolvedValue(mockBookWithLocation)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)
    
    // 本社: 3冊登録、貸出2冊の60%（1.2冊）なので1冊貸出、2冊利用可能
    expect(screen.getByText('本社')).toBeInTheDocument()
    expect(screen.getByText('2冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 3冊)')).toBeInTheDocument()
    
    // 支社: 2冊登録、貸出2冊の40%（0.8冊）なので1冊貸出、1冊利用可能
    expect(screen.getByText('支社')).toBeInTheDocument()
    expect(screen.getByText('1冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 2冊)')).toBeInTheDocument()
  })

  it('同一保管場所の複数登録で在庫数が正しく集計される', async () => {
    const mockBookSameLocation = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: '東京オフィス' } },
        { locationId: 1, location: { id: 1, name: '東京オフィス' } },
        { locationId: 1, location: { id: 1, name: '東京オフィス' } },
        { locationId: 1, location: { id: 1, name: '東京オフィス' } },
        { locationId: 1, location: { id: 1, name: '東京オフィス' } },
      ],
      lendingHistories: [
        { id: 1, userId: 10 },
        { id: 2, userId: 11 },
      ],
      _count: {
        reservations: 0,
      },
    }
    // @ts-ignore
    prismaBookMock.mockResolvedValue(mockBookSameLocation)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)
    
    // 東京オフィス: 5冊登録、2冊貸出なので3冊利用可能
    expect(screen.getByText('東京オフィス')).toBeInTheDocument()
    expect(screen.getByText('3冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 5冊)')).toBeInTheDocument()
  })

  it('貸出数が在庫数を上回る場合、貸し出し可能数は0になる', async () => {
    const mockBookOverLent = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: '小規模オフィス' } },
        { locationId: 1, location: { id: 1, name: '小規模オフィス' } },
      ],
      lendingHistories: [
        { id: 1, userId: 10 },
        { id: 2, userId: 11 },
        { id: 3, userId: 12 },
        { id: 4, userId: 13 },
        { id: 5, userId: 14 },
      ],
      _count: {
        reservations: 0,
      },
    }
    // @ts-ignore
    prismaBookMock.mockResolvedValue(mockBookOverLent)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)
    
    // 小規模オフィス: 2冊登録、5冊貸出なので0冊利用可能
    expect(screen.getByText('小規模オフィス')).toBeInTheDocument()
    expect(screen.getByText('0冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 2冊)')).toBeInTheDocument()
  })

  it('複数保管場所での比例配分計算が正確に行われる', async () => {
    const mockBookMultiLocation = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: 'A拠点' } },
        { locationId: 1, location: { id: 1, name: 'A拠点' } },
        { locationId: 1, location: { id: 1, name: 'A拠点' } },
        { locationId: 1, location: { id: 1, name: 'A拠点' } },
        { locationId: 2, location: { id: 2, name: 'B拠点' } },
        { locationId: 2, location: { id: 2, name: 'B拠点' } },
        { locationId: 3, location: { id: 3, name: 'C拠点' } },
      ],
      lendingHistories: [
        { id: 1, userId: 10 },
        { id: 2, userId: 11 },
        { id: 3, userId: 12 },
      ],
      _count: {
        reservations: 2,
      },
    }
    // @ts-ignore
    prismaBookMock.mockResolvedValue(mockBookMultiLocation)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)
    
    // A拠点: 4冊(4/7)、貸出3冊の4/7 = 1.7 → 2冊貸出、2冊利用可能
    expect(screen.getByText('A拠点')).toBeInTheDocument()
    expect(screen.getByText('2冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 4冊)')).toBeInTheDocument()
    
    // B拠点: 2冊(2/7)、貸出3冊の2/7 = 0.86 → 1冊貸出、1冊利用可能
    expect(screen.getByText('B拠点')).toBeInTheDocument()
    expect(screen.getByText('1冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 2冊)')).toBeInTheDocument()
    
    // C拠点: 1冊(1/7)、貸出3冊の1/7 = 0.43 → 0冊貸出、1冊利用可能
    expect(screen.getByText('C拠点')).toBeInTheDocument()
    expect(screen.getByText('1冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 1冊)')).toBeInTheDocument()
  })

  it('保管場所情報が不完全な場合は無視される', async () => {
    const mockBookIncompleteLocation = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: '正常な拠点' } },
        { locationId: null, location: null }, // 不完全なデータ
        { locationId: 2, location: null }, // locationが欠落
        { locationId: null, location: { id: 3, name: '不完全' } }, // locationIdが欠落
        { locationId: 1, location: { id: 1, name: '正常な拠点' } },
      ],
      lendingHistories: [],
      _count: {
        reservations: 0,
      },
    }
    // @ts-ignore
    prismaBookMock.mockResolvedValue(mockBookIncompleteLocation)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)
    
    // 正常な拠点のみが表示される（2冊登録）
    expect(screen.getByText('正常な拠点')).toBeInTheDocument()
    expect(screen.getByText('2冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 2冊)')).toBeInTheDocument()
    
    // 不完全なデータは表示されない
    expect(screen.queryByText('不完全')).not.toBeInTheDocument()
  })
})
