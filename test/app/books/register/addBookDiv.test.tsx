import { fireEvent, render } from '@testing-library/react'
import { user1 } from '../../../__utils__/data/user'

const addBookActionMock = vi.fn()
vi.mock('@/app/books/register/actions', () => ({
  __esModule: true,
  addBook: { bind: () => () => addBookActionMock() },
}))

describe('add book div component', () => {
  const AddBookDivComponent = require('@/app/books/register/addBookDiv').default

  it('追加ボタンをクリックすると、server actionが実行される', async () => {
    const companyBook = { id: 1, _count: { registrationHistories: 2 } }
    const userId = user1.id
    const { getByRole, getByText } = render(
      <AddBookDivComponent companyBook={companyBook} userId={userId} />,
    )

    expect(getByText(/現在の登録冊数：2/)).toBeInTheDocument()
    expect(addBookActionMock).not.toBeCalled()

    fireEvent.click(getByRole('button', { name: '追加する' }))

    expect(addBookActionMock).toBeCalledTimes(1)
  })
})
