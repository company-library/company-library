import { fireEvent, render, waitFor } from '@testing-library/react'
import GoogleBook from '@/components/googleBook'
import useSWR from 'swr'
import Image from 'next/image'
import { global } from 'styled-jsx/css'

jest.mock('swr')
jest.mock('next/image')

describe('googleBook component', () => {
  const expectedIsbn = '1234567890123'
  const expectedTitle = '書籍タイトル'
  const expectedThumbnailUrl = '/thumbnail.png'

  // @ts-ignore
  const swrMock = useSWR.mockReturnValue({
    data: {
      items: [
        {
          volumeInfo: {
            title: expectedTitle,
            imageLinks: {
              thumbnail: expectedThumbnailUrl,
            },
          },
        },
      ],
    },
  })
  const expectedBookId = 123
  const getBookByIsbnMock = jest
    .spyOn(require('@/generated/graphql.client'), 'useGetBookByIsbnQuery')
    .mockReturnValue([
      {
        data: {
          books: [
            {
              id: expectedBookId,
              title: expectedTitle,
              registrationHistories: [
                {
                  id: 1,
                },
              ],
            },
          ],
        },
      },
    ])
  const insertBookMock = jest.fn().mockReturnValue(new Promise((resolve, _reject) => {
    resolve({ data: { insert_books_one: { id: expectedBookId } } })
  }))
  jest
    .spyOn(require('@/generated/graphql.client'), 'useInsertBookMutation')
    .mockReturnValue([undefined, insertBookMock])
  const insertRegistrationHistoryMock = jest
    .fn()
    .mockReturnValue(new Promise((resolve, _reject) => {
      resolve({})
    }))
  jest
    .spyOn(require('@/generated/graphql.client'), 'useInsertRegistrationHistoryMutation')
    .mockReturnValue([undefined, insertRegistrationHistoryMock])
  const ImageMock = (Image as jest.Mock).mockImplementation(() => {
    return <span></span>
  })
  const expectedUserId = 456
  const useCustomUserMock = jest
    .spyOn(require('@/hooks/useCustomUser'), 'useCustomUser')
    .mockReturnValue({ user: { id: expectedUserId } })
  const fetchMock = jest.fn()
  // @ts-ignore
  global.fetch = fetchMock
  const pushMock = jest.fn()
  jest
    .spyOn(require('next/router'), 'useRouter')
    .mockReturnValue({ push: pushMock })


  it('ISBNを与えると、該当の書籍が表示される', () => {
    const { getByText } = render(<GoogleBook isbn={expectedIsbn} />)

    expect(getByText(expectedTitle)).toBeInTheDocument()
    expect(ImageMock).toBeCalledWith(
      {
        alt: expectedTitle,
        src: expectedThumbnailUrl,
        width: 300,
        height: 400,
      },
      {},
    )
  })

  it('該当の書籍を追加できる', () => {
    const { getByText } = render(<GoogleBook isbn={expectedIsbn} />)

    expect(getByText('追加する')).toBeInTheDocument()
    expect(insertRegistrationHistoryMock).not.toBeCalled()

    fireEvent.click(getByText('追加する'))

    expect(insertRegistrationHistoryMock).toBeCalledWith({
      bookId: expectedBookId,
      userId: expectedUserId
    })
  })

  it('該当の書籍を登録できる', async () => {
    getBookByIsbnMock.mockReturnValueOnce([
      {
        data: {
          books: [],
        },
      },
    ])

    const { getByText } = render(<GoogleBook isbn={expectedIsbn} />)

    expect(getByText('登録する')).toBeInTheDocument()
    expect(insertBookMock).not.toBeCalled()
    expect(insertRegistrationHistoryMock).not.toBeCalled()

    fireEvent.click(getByText('登録する'))

    expect(insertBookMock).toBeCalledWith({
      title: expectedTitle,
      isbn: expectedIsbn,
      imageUrl: expectedThumbnailUrl
    })
    await waitFor(() => expect(insertRegistrationHistoryMock).toBeCalledWith({
      bookId: expectedBookId,
      userId: expectedUserId
    }))
    await waitFor(() => expect(fetchMock).toBeCalledWith(`/api/books/notifyRegistration/${expectedBookId}`))
    await waitFor(() => expect(pushMock).toBeCalledWith(`/books/${expectedBookId}`))
  })

  it('Sessionからユーザー情報が取得できない場合、ユーザーが見つからない旨のメッセージが表示される', () => {
    useCustomUserMock.mockReturnValueOnce({
      user: {}
    })

    const { getByText } = render(<GoogleBook isbn={expectedIsbn} />)

    expect(getByText('ユーザーは見つかりませんでした')).toBeInTheDocument()
  })

  it('書籍が見つからない場合、書籍が見つからない旨のメッセージが表示される', () => {
    swrMock.mockReturnValueOnce({
      data: {},
    })

    const { getByText } = render(<GoogleBook isbn={expectedIsbn} />)

    expect(getByText('書籍は見つかりませんでした')).toBeInTheDocument()
  })
})
