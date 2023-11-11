import { render, screen } from '@testing-library/react'
import { user1 } from '../../../__utils__/data/user'

const getServerSessionMock = jest.fn().mockReturnValue({ customUser: { id: user1.id } })
jest.mock('next-auth', () => ({
  __esModule: true,
  getServerSession: () => getServerSessionMock(),
}))

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  __esModule: true,
  authOptions: {},
}))

describe('register page', () => {
  const RegisterPage = require('@/app/books/register/page').default

  it('13桁入力するとGoogleBookのコンポーネントが表示される', async () => {
    render(await RegisterPage())

    expect(screen.getByText('本を登録')).toBeInTheDocument()
  })
})
