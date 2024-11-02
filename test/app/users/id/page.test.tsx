import UserDetailPage from '@/app/users/[id]/page'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { user1 } from '../../../__utils__/data/user'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'

describe('UserDetail page', async () => {
  const expectedUser = user1

  vi.mock('@/app/users/[id]/bookList', () => ({
    default: () => <div>BookList</div>,
  }))
  vi.mock('@/app/users/[id]/readingBookList', () => ({
    default: () => <div>ReadingBookList</div>,
  }))

  it('ユーザーの情報が表示される', async () => {
    prismaMock.user.findUnique.mockResolvedValue(expectedUser)

    render(
      <Suspense>
        <UserDetailPage params={new Promise((resolve) => resolve({ id: '1' }))} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText('テスト太郎さんの情報')).toBeInTheDocument()
    expect(screen.getByText('現在読んでいる書籍(3冊)'))
    expect(screen.getByText('今まで読んだ書籍(4冊)'))
  })

  it('クエリにidがない場合は、「Error!」と表示される', async () => {
    render(
      <Suspense>
        {/* @ts-ignore */}
        <UserDetailPage params={{}} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText('Error!')).toBeInTheDocument()
  })

  it('該当するidのユーザーがない場合は、「Error!」と表示される', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    render(
      <Suspense>
        <UserDetailPage params={new Promise((resolve) => resolve({ id: '1' }))} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText('Error!')).toBeInTheDocument()
  })

  it('利用者一覧の読み込みに失敗した場合、「Error!」と表示される', async () => {
    const expectErrorMsg = 'query has errored!'
    console.error = vi.fn()
    prismaMock.user.findUnique.mockRejectedValue(expectErrorMsg)

    render(
      <Suspense>
        <UserDetailPage params={new Promise((resolve) => resolve({ id: '1' }))} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText('Error!')).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectErrorMsg)
  })
})
