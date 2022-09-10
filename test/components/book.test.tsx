import { render } from '@testing-library/react'
import Book from '@/components/book'
import Image from 'next/image'
import { bookWithImage, bookWithoutImage } from '../__utils__/data/book'

jest.mock('next/image')

describe('book component', () => {
  const ImageMock = (Image as jest.Mock).mockImplementation(() => {
    return <span></span>
  })

  it('本のタイトルと画像が表示される', () => {
    const { getByText } = render(<Book book={bookWithImage} />)

    expect(getByText(bookWithImage.title)).toBeInTheDocument()
    expect(ImageMock).toBeCalledWith(
      {
        src: bookWithImage.imageUrl,
        alt: bookWithImage.title,
        width: 128,
        height: 200,
      },
      {},
    )
  })

  it('画像が無い場合はNoImageが表示される', () => {
    const { getByText } = render(<Book book={bookWithoutImage} />)

    expect(getByText(bookWithoutImage.title)).toBeInTheDocument()
    const args = ImageMock.mock.calls[0][0]
    expect(args.src).toBe('/no_image.jpg')
    expect(args.src).toBe('/no_image.jpg')
    expect(ImageMock).toBeCalledWith(
      {
        src: '/no_image.jpg',
        alt: bookWithoutImage.title,
        width: 128,
        height: 200,
      },
      {},
    )
  })
})
