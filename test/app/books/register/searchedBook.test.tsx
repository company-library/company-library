import { render } from '@testing-library/react'
import { user1 } from '../../../__utils__/data/user'
import useSWR from 'swr'

const addRegisterBookDivMock = jest.fn().mockImplementation(() => <>add book div component</>)
jest.mock('@/app/books/register/addBookDiv', () => ({
  __esModule: true,
  default: addRegisterBookDivMock,
}))
const registerBookDivMock = jest.fn().mockImplementation(() => <>register book div component</>)
jest.mock('@/app/books/register/registerBookDiv', () => ({
  __esModule: true,
  default: registerBookDivMock,
}))
jest.mock('swr')

describe('searched book component', () => {
  const swrMock = useSWR as jest.Mock
  const userId = user1.id
  const isbn = '1234567890123'
  const bookTitle = 'testBook'

  const SearchedBookComponent = require('@/app/books/register/searchedBook').default

  it('書籍情報が表示される', () => {
    swrMock
      .mockReturnValueOnce({
        data: {
          items: [
            {
              volumeInfo: {
                title: bookTitle,
              },
            },
          ],
        },
      })
      .mockReturnValueOnce({ data: { book: {} } })

    const { getByText } = render(<SearchedBookComponent isbn={isbn} userId={userId} />)

    expect(getByText('こちらの本でしょうか？')).toBeInTheDocument()
    expect(getByText('testBook')).toBeInTheDocument()
    expect(getByText('register book div component')).toBeInTheDocument()
  })

  it('登録済みの書籍の場合は書籍を追加するためのコンポーネントを表示する', () => {
    const companyBook = { _count: { registrationHistories: 1 } }
    swrMock
      .mockReturnValueOnce({
        data: {
          items: [
            {
              volumeInfo: {
                title: bookTitle,
              },
            },
          ],
        },
      })
      .mockReturnValueOnce({ data: { book: companyBook } })

    render(<SearchedBookComponent isbn={isbn} userId={userId} />)

    expect(addRegisterBookDivMock).toBeCalledWith(
      {
        companyBook,
        userId: user1.id,
      },
      undefined,
    )
    expect(registerBookDivMock).not.toBeCalled()
  })

  it('登録がない書籍の場合は書籍を新規登録するためのコンポーネントを表示する', () => {
    swrMock
      .mockReturnValueOnce({
        data: {
          items: [
            {
              volumeInfo: {
                title: bookTitle,
              },
            },
          ],
        },
      })
      .mockReturnValueOnce({ data: { book: {} } })

    render(<SearchedBookComponent isbn={isbn} userId={userId} />)

    expect(addRegisterBookDivMock).not.toBeCalled()
    expect(registerBookDivMock).toBeCalledWith(
      {
        title: bookTitle,
        isbn: isbn,
        thumbnailUrl: undefined,
        userId: userId,
      },
      undefined,
    )
  })

  it('存在しない書籍の場合は書籍が見つからなかった旨のメッセージを表示する', () => {
    swrMock.mockReturnValueOnce({ data: undefined }).mockReturnValueOnce({ data: { book: {} } })

    const { getByText } = render(<SearchedBookComponent isbn={isbn} userId={userId} />)

    expect(getByText('書籍は見つかりませんでした')).toBeInTheDocument()
  })
})
