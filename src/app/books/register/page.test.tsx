import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import RegisterPage from '@/app/books/register/page'
import { user1 } from '../../../../test/__utils__/data/user'

describe('register page', async () => {
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

  vi.mock('@/app/books/register/bookForm', () => ({
    default: () => <div>登録フォーム</div>,
  }))

  beforeEach(() => {
    getServerSessionMock.mockReturnValue({ customUser: { id: user1.id } })
  })

  it('書籍登録ページが表示される', async () => {
    render(
      <Suspense>
        <RegisterPage />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText('本を登録')).toBeInTheDocument()
  })

  it('セッションが取得できない場合はエラーメッセージが表示される', async () => {
    getServerSessionMock.mockReturnValue(null)

    render(
      <Suspense>
        <RegisterPage />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(
      await screen.findByText('セッションが取得できませんでした。再読み込みしてみてください。'),
    ).toBeInTheDocument()
  })
})
