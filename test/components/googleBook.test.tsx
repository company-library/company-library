import { render } from '@testing-library/react'
import GoogleBook from '@/components/googleBook'
import useSWR from 'swr'
import Image from 'next/image'

jest.mock('swr')
jest.mock('next/image')

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
  const ImageMock = (Image as jest.Mock).mockImplementation(() => {
    return <span></span>
  })

  it('ISBNを与えると、該当の書籍が表示される', () => {
    const { getByText } = render(<GoogleBook isbn="1234567890123" />)

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

  it('書籍が見つからない場合、書籍が見つからない旨のメッセージが表示される', () => {
    swrMock.mockReturnValue({
      data: {},
    })

    const { getByText } = render(<GoogleBook isbn="1234567890123" />)

    expect(getByText('書籍は見つかりませんでした')).toBeInTheDocument()
  })
})
