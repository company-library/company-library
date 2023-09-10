import GoogleBook from '@/components/googleBook'
import { fireEvent, render } from '@testing-library/react'

jest.mock('@/components/layout')
jest.mock('@/components/googleBook')

describe('book form component', () => {
  ;(GoogleBook as jest.Mock).mockImplementation(() => {
    return <>google book component</>
  })

  const BookFormComponent = require('@/app/books/register/bookForm').default

  it('13桁入力するとGoogleBookのコンポーネントが表示される', () => {
    const { getByText, queryByText, getByLabelText } = render(<BookFormComponent />)

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
