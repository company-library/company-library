import { render, screen } from '@testing-library/react'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'
import { user1, user2 } from '../../../__utils__/data/user'
import { bookWithImage } from '../../../__utils__/data/book'
import { Suspense } from 'react'

const BookDetailMock = vi.fn().mockReturnValue(<div>bookDetail</div>)
vi.mock('@/app/books/[id]/bookDetail', () => ({
  __esModule: true,
  default: (...args: any) => BookDetailMock(...args),
}))

const LendingListMock = vi.fn().mockReturnValue(<div>lendingList</div>)
vi.mock('@/app/books/[id]/lendingList', () => ({
  __esModule: true,
  default: (...args: any) => LendingListMock(...args),
}))

const ImpressionListMock = vi.fn().mockReturnValue(<div>impressionList</div>)
vi.mock('@/app/books/[id]/impressionList', () => ({
  __esModule: true,
  default: (...args: any) => ImpressionListMock(...args),
}))

const ReturnListMock = vi.fn().mockReturnValue(<div>returnList</div>)
vi.mock('@/app/books/[id]/returnList', () => ({
  __esModule: true,
  default: (...args: any) => ReturnListMock(...args),
}))

const getServerSessionMock = vi.fn().mockReturnValue({ customUser: { id: user1.id } })
vi.mock('next-auth', () => ({
  __esModule: true,
  getServerSession: () => getServerSessionMock(),
}))

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  __esModule: true,
  authOptions: {},
}))

describe('BookDetail page', async () => {
  prismaMock.user.findMany.mockResolvedValue([user1, user2])

  const BookDetailPage = (await import('@/app/books/[id]/page')).default

  const book = bookWithImage

  it('本の情報の読み込みが完了した場合は、詳細情報を表示する', async () => {
    render(
      <Suspense>
        <BookDetailPage params={{ id: book.id.toString() }} />{' '}
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
    getServerSessionMock.mockReturnValueOnce(null)

    render(await BookDetailPage({ params: { id: '1' } }))

    expect(
      screen.getByText('セッションが取得できませんでした。再読み込みしてみてください。'),
    ).toBeInTheDocument()
  })

  it('書籍のIDが数値でなかった場合は、エラーメッセージを表示する', async () => {
    const { rerender } = render(await BookDetailPage({ params: { id: 'true' } }))
    expect(screen.getByText('不正な書籍です。')).toBeInTheDocument()

    rerender(await BookDetailPage({ params: { id: '1n' } }))
    expect(screen.getByText('不正な書籍です。')).toBeInTheDocument()
  })

  it('セッションが取得できなかった場合は、エラーメッセージを表示する', async () => {
    getServerSessionMock.mockReturnValueOnce(null)

    render(await BookDetailPage({ params: { id: '1' } }))

    expect(
      screen.getByText('セッションが取得できませんでした。再読み込みしてみてください。'),
    ).toBeInTheDocument()
  })
})
