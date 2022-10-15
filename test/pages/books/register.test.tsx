import Layout from '@/components/layout'
import GoogleBook from '@/components/googleBook'
import { fireEvent, render } from '@testing-library/react'
import Register from '@/pages/books/register'

jest.mock('@/components/layout')
jest.mock('@/components/googleBook')

describe('register page', () => {
  const layoutMock = (Layout as jest.Mock)
    .mockImplementation(({ children }) => {
      return <div>{children}</div>
    })(GoogleBook as jest.Mock)
    .mockImplementation(() => {
      return <>google book component</>
    })

  it('13桁入力するとGoogleBookのコンポーネントが表示される', () => {
    const { getByText, queryByText, getByLabelText } = render(<Register />)

    expect(layoutMock.mock.calls[0][0].title).toBe('本を登録 | company-library')
    expect(getByText('本を登録')).toBeInTheDocument()

    const input = getByLabelText('ISBN（13桁）を入力してください')
    // 12桁だと表示されない
    fireEvent.change(input, {
      target: { value: '123456789012' },
    })
    expect(queryByText('google book component')).not.toBeInTheDocument()
    // 13桁だと表示される
    fireEvent.change(input, {
      target: { value: '1234567890123' },
    })
    expect(getByText('google book component')).toBeInTheDocument()
    // 14桁だと表示されない
    fireEvent.change(input, {
      target: { value: '12345678901234' },
    })
    expect(queryByText('google book component')).not.toBeInTheDocument()
  })
})
