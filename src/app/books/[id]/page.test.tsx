import { act, render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import BookDetailPage from '@/app/books/[id]/page'
import { bookWithImage } from '../../../../test/__utils__/data/book'
import { user1, user2 } from '../../../../test/__utils__/data/user'
import { prismaMock } from '../../../../test/__utils__/libs/prisma/singleton'

const { BookDetailMock } = vi.hoisted(() => {
  return {
    BookDetailMock: vi.fn(),
  }
})

vi.mock('@/app/books/[id]/bookDetail', () => ({
  default: (...args: unknown[]) => BookDetailMock(...args),
}))

const { LendingListMock } = vi.hoisted(() => {
  return {
    LendingListMock: vi.fn(),
  }
})

vi.mock('@/app/books/[id]/lendingList', () => ({
  default: (...args: unknown[]) => LendingListMock(...args),
}))

const { ImpressionListMock } = vi.hoisted(() => {
  return {
    ImpressionListMock: vi.fn(),
  }
})

vi.mock('@/app/books/[id]/impressionList', () => ({
  default: (...args: unknown[]) => ImpressionListMock(...args),
}))

const { ReturnListMock } = vi.hoisted(() => {
  return {
    ReturnListMock: vi.fn(),
  }
})

vi.mock('@/app/books/[id]/returnList', () => ({
  default: (...args: unknown[]) => ReturnListMock(...args),
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

describe('BookDetail page', async () => {
  prismaMock.user.findMany.mockResolvedValue([user1, user2])

  const book = bookWithImage

  beforeEach(() => {
    BookDetailMock.mockReturnValue(<div>BookDetail</div>)
    LendingListMock.mockReturnValue(<div>LendingList</div>)
    ImpressionListMock.mockReturnValue(<div>ImpressionList</div>)
    ReturnListMock.mockReturnValue(<div>ReturnList</div>)
    getServerSessionMock.mockReturnValue({ customUser: { id: user1.id } })
  })

  it('本の情報の読み込みが完了した場合は、詳細情報を表示する', async () => {
    await act(async () => {
      render(
        <Suspense>
          <BookDetailPage params={new Promise((resolve) => resolve({ id: book.id.toString() }))} />
        </Suspense>,
      )
    })

    const heading2s = screen.getAllByRole('heading', { level: 2 })
    expect(heading2s.length).toBe(3)
    expect(heading2s[0].textContent).toBe('借りているユーザー')
    expect(heading2s[1].textContent).toBe('感想')
    expect(heading2s[2].textContent).toBe('借りたユーザー')
    expect(BookDetailMock).toBeCalled()
    expect(BookDetailMock).toBeCalledWith({ bookId: book.id, userId: user1.id }, undefined)
    expect(LendingListMock).toBeCalledWith({ bookId: book.id }, undefined)
    expect(ImpressionListMock).toBeCalledWith({ bookId: book.id, userId: user1.id }, undefined)
    expect(ReturnListMock).toBeCalledWith({ bookId: book.id }, undefined)
  })

  it('セッションが取得できなかった場合は、エラーメッセージを表示する', async () => {
    getServerSessionMock.mockReturnValue(null)

    await act(async () => {
      render(
        <Suspense>
          <BookDetailPage params={new Promise((resolve) => resolve({ id: '1' }))} />
        </Suspense>,
      )
    })

    expect(
      screen.getByText('セッションが取得できませんでした。再読み込みしてみてください。'),
    ).toBeInTheDocument()
  })

  it('書籍のIDが数値でなかった場合は、エラーメッセージを表示する', async () => {
    let rerender: (ui: React.ReactElement) => void
    await act(async () => {
      const result = render(
        <Suspense>
          <BookDetailPage params={new Promise((resolve) => resolve({ id: 'true' }))} />
        </Suspense>,
      )
      rerender = result.rerender
    })

    expect(screen.getByText('不正な書籍です。')).toBeInTheDocument()

    await act(async () => {
      rerender(
        <Suspense>
          <BookDetailPage params={new Promise((resolve) => resolve({ id: '1n' }))} />
        </Suspense>,
      )
    })

    expect(screen.getByText('不正な書籍です。')).toBeInTheDocument()
  })

  it('セッションが取得できなかった場合は、エラーメッセージを表示する', async () => {
    getServerSessionMock.mockReturnValue(null)

    await act(async () => {
      render(
        <Suspense>
          <BookDetailPage params={new Promise((resolve) => resolve({ id: '1' }))} />
        </Suspense>,
      )
    })

    expect(
      screen.getByText('セッションが取得できませんでした。再読み込みしてみてください。'),
    ).toBeInTheDocument()
  })
})
