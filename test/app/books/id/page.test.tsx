import BookDetailPage from '@/app/books/[id]/page'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { bookWithImage } from '../../../__utils__/data/book'
import { user1, user2 } from '../../../__utils__/data/user'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'

describe('BookDetail page', async () => {
  prismaMock.user.findMany.mockResolvedValue([user1, user2])
  const { BookDetailMock } = vi.hoisted(() => {
    return {
      BookDetailMock: vi.fn(),
    }
  })
  vi.mock('@/app/books/[id]/bookDetail', () => ({
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    default: (...args: any) => BookDetailMock(...args),
  }))

  const { LendingListMock } = vi.hoisted(() => {
    return {
      LendingListMock: vi.fn(),
    }
  })
  vi.mock('@/app/books/[id]/lendingList', () => ({
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    default: (...args: any) => LendingListMock(...args),
  }))

  const { ImpressionListMock } = vi.hoisted(() => {
    return {
      ImpressionListMock: vi.fn(),
    }
  })
  vi.mock('@/app/books/[id]/impressionList', () => ({
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    default: (...args: any) => ImpressionListMock(...args),
  }))

  const { ReturnListMock } = vi.hoisted(() => {
    return {
      ReturnListMock: vi.fn(),
    }
  })
  vi.mock('@/app/books/[id]/returnList', () => ({
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    default: (...args: any) => ReturnListMock(...args),
  }))

  const { getServerSessionMock } = vi.hoisted(() => {
    return {
      getServerSessionMock: vi.fn(),
    }
  })
  vi.mock('next-auth', () => ({
    getServerSession: () => getServerSessionMock(),
  }))

  vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
    authOptions: {},
  }))

  const book = bookWithImage

  beforeEach(() => {
    BookDetailMock.mockReturnValue(<div>BookDetail</div>)
    LendingListMock.mockReturnValue(<div>LendingList</div>)
    ImpressionListMock.mockReturnValue(<div>ImpressionList</div>)
    ReturnListMock.mockReturnValue(<div>ReturnList</div>)
    getServerSessionMock.mockReturnValue({ customUser: { id: user1.id } })
  })

  it('本の情報の読み込みが完了した場合は、詳細情報を表示する', async () => {
    render(
      <Suspense>
        <BookDetailPage params={new Promise((resolve) => resolve({ id: book.id.toString() }))} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    const heading2s = await screen.findAllByRole('heading', { level: 2 })
    expect(heading2s.length).toBe(3)
    expect(heading2s[0].textContent).toBe('借りているユーザー')
    expect(heading2s[1].textContent).toBe('感想')
    expect(heading2s[2].textContent).toBe('借りたユーザー')
    expect(BookDetailMock).toBeCalled()
    expect(BookDetailMock).toBeCalledWith({ bookId: book.id, userId: user1.id }, undefined)
    expect(LendingListMock).toBeCalledWith({ bookId: book.id }, undefined)
    expect(ImpressionListMock).toBeCalledWith({ bookId: book.id }, undefined)
    expect(ReturnListMock).toBeCalledWith({ bookId: book.id }, undefined)
  })

  it('セッションが取得できなかった場合は、エラーメッセージを表示する', async () => {
    getServerSessionMock.mockReturnValue(null)

    render(
      <Suspense>
        <BookDetailPage params={new Promise((resolve) => resolve({ id: '1' }))} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(
      await screen.findByText('セッションが取得できませんでした。再読み込みしてみてください。'),
    ).toBeInTheDocument()
  })

  it('書籍のIDが数値でなかった場合は、エラーメッセージを表示する', async () => {
    const { rerender } = render(
      <Suspense>
        <BookDetailPage params={new Promise((resolve) => resolve({ id: 'true' }))} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText('不正な書籍です。')).toBeInTheDocument()

    rerender(
      <Suspense>
        <BookDetailPage params={new Promise((resolve) => resolve({ id: '1n' }))} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText('不正な書籍です。')).toBeInTheDocument()
  })

  it('セッションが取得できなかった場合は、エラーメッセージを表示する', async () => {
    getServerSessionMock.mockReturnValue(null)

    render(
      <Suspense>
        <BookDetailPage params={new Promise((resolve) => resolve({ id: '1' }))} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(
      await screen.findByText('セッションが取得できませんでした。再読み込みしてみてください。'),
    ).toBeInTheDocument()
  })
})
