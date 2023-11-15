import { fireEvent, render } from '@testing-library/react'
import { user1 } from '../../../__utils__/data/user'

const addBookActionMock = jest.fn()
jest.mock('@/app/books/register/actions', () => ({
  __esModule: true,
  addBook: { bind: () => () => addBookActionMock() },
}))

describe('add book div component', () => {
  const AddBookDivComponent = require('@/app/books/register/addBookDiv').default

  it('登録完了画面が表示される', () => {
    const companyBook = { id: 1, _count: { registrationHistories: 2 } }
    const userId = user1.id

    const { getByText } = render(<AddBookDivComponent companyBook={companyBook} userId={userId} />)

    expect(getByText(/現在の登録冊数：2/)).toBeInTheDocument()
  })

  // react, react-domのバージョンがexperimentalのものだと、テストが通る
  // 18.2.0(現時点の最新)だと、テストが通らない
  // https://github.com/vercel/next.js/issues/54757
  it('登録完了画面で追加ボタンをクリックすると、server actionが実行される', async () => {
    const companyBook = { id: 1, _count: { registrationHistories: 2 } }
    const userId = user1.id
    const { getByText } = render(<AddBookDivComponent companyBook={companyBook} userId={userId} />)

    expect(addBookActionMock).not.toBeCalled()

    fireEvent.click(getByText('追加する'))

    expect(addBookActionMock).toBeCalledTimes(1)
  })
})
