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
})
