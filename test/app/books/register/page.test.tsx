import { render, screen } from '@testing-library/react'
import { user1 } from '../../../__utils__/data/user'
import { Suspense } from 'react'

describe('register page', async () => {
  const { getServerSessionMock } = vi.hoisted(() => {
    return {
      getServerSessionMock: vi.fn().mockImplementation(() => {
        return {
          customUser: {
            id: user1.id,
          },
        }
      }),
    }
  })
  vi.mock('next-auth', () => ({
    __esModule: true,
    getServerSession: () => getServerSessionMock(),
  }))

  vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
    __esModule: true,
    authOptions: {},
  }))

  vi.mock('@/app/books/register/bookForm', () => ({
    __esModule: true,
    default: () => <div>登録フォーム</div>,
  }))

  const RegisterPage = (await import('@/app/books/register/page')).default

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
    getServerSessionMock.mockImplementation(() => null)

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
