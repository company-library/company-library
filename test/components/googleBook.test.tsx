import { fireEvent, render } from '@testing-library/react'
import GoogleBook from '@/components/googleBook'
import useSWR from 'swr'

jest.mock('swr')
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line
    return <img {...props} />
  }
}))

describe('googleBook component', () => {
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
  const getBookByIsbnMock = jest
    .spyOn(require('@/generated/graphql.client'), 'useGetBookByIsbnQuery')
    .mockReturnValue([
      {
        data: {
          books: [
            {
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
  const insertBookMock = jest.fn().mockReturnValue(new Promise((_resolve, _reject) => {}))
  jest
    .spyOn(require('@/generated/graphql.client'), 'useInsertBookMutation')
    .mockReturnValue([undefined, insertBookMock])
  const insertRegistrationHistoryMock = jest
    .fn()
    .mockReturnValue(new Promise((_resolve, _reject) => {}))
  jest
    .spyOn(require('@/generated/graphql.client'), 'useInsertRegistrationHistoryMutation')
    .mockReturnValue([undefined, insertRegistrationHistoryMock])
  jest.spyOn(require('next/router'), 'useRouter').mockReturnValue({ push: jest.fn() })

  it('ISBNを与えると、該当の書籍が表示される', () => {
    const { getByText, getByTestId } = render(<GoogleBook isbn="1234567890123" />)

    expect(getByText(expectedTitle)).toBeInTheDocument()
    expect(getByTestId('bookImg')).toHaveAttribute('src', expectedThumbnailUrl)
    expect(getByTestId('bookImg')).toHaveAttribute('alt', expectedTitle)
  })

  it('該当の書籍を追加できる', () => {
    const { getByText } = render(<GoogleBook isbn="1234567890123" />)

    expect(getByText('追加する')).toBeInTheDocument()
    expect(insertRegistrationHistoryMock).not.toBeCalled()

    fireEvent.click(getByText('追加する'))

    expect(insertRegistrationHistoryMock).toBeCalled()
  })

  it('該当の書籍を登録できる', () => {
    getBookByIsbnMock.mockReturnValueOnce([
      {
        data: {
          books: [],
        },
      },
    ])

    const { getByText } = render(<GoogleBook isbn="1234567890123" />)

    expect(getByText('登録する')).toBeInTheDocument()
    expect(insertBookMock).not.toBeCalled()

    fireEvent.click(getByText('登録する'))

    expect(insertBookMock).toBeCalled()
  })

  it('書籍が見つからない場合、書籍が見つからない旨のメッセージが表示される', () => {
    swrMock.mockReturnValue({
      data: {},
    })

    const { getByText } = render(<GoogleBook isbn="1234567890123" />)

    expect(getByText('書籍は見つかりませんでした')).toBeInTheDocument()
  })
})
