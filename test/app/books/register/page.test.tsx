import { render } from '@testing-library/react'

describe('register page', () => {
  const RegisterPage = require('@/app/books/register/page').default

  it('13桁入力するとGoogleBookのコンポーネントが表示される', () => {
    const { getByText } = render(<RegisterPage />)

    expect(getByText('本を登録')).toBeInTheDocument()
  })
})
