import BookForm from '@/app/books/register/bookForm'
import { fireEvent, render } from '@testing-library/react'
import { user1 } from '../../../__utils__/data/user'

describe('book form component', async () => {
  vi.mock('@/app/books/register/searchedBook', () => ({
    default: vi.fn().mockImplementation(() => <>searched book component</>),
  }))

  it('13桁入力するとGoogleBookのコンポーネントが表示される', () => {
    const { getByText, queryByText, getByLabelText } = render(<BookForm userId={user1.id} />)

    const input = getByLabelText('ISBN（13桁）を入力してください')
    // 12桁だと表示されない
    fireEvent.change(input, {
      target: { value: '123456789012' },
    })
    expect(queryByText('searched book component')).not.toBeInTheDocument()
    // 13桁だと表示される
    fireEvent.change(input, {
      target: { value: '1234567890123' },
    })
    expect(getByText('searched book component')).toBeInTheDocument()
    // 14桁だと表示されない
    fireEvent.change(input, {
      target: { value: '12345678901234' },
    })
    expect(queryByText('searched book component')).not.toBeInTheDocument()
  })
})
