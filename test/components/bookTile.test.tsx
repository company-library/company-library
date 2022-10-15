import { render } from '@testing-library/react'
import BookTile from '@/components/bookTile'
import Image from 'next/image'
import { bookWithImage, bookWithoutImage } from '../__utils__/data/book'

jest.mock('next/image')

describe('book component', () => {
  const ImageMock = (Image as jest.Mock).mockImplementation(() => {
    return <span></span>
  })

  it('本のタイトルと画像が表示される', () => {
    const { getByText } = render(<BookTile book={bookWithImage} />)

    expect(getByText(bookWithImage.title)).toBeInTheDocument()
    expect(ImageMock).toBeCalledWith(
      {
        src: bookWithImage.imageUrl,
        alt: bookWithImage.title,
        width: 300,
        height: 400,
      },
      {},
    )
  })

  it('画像が無い場合はNoImageが表示される', () => {
    const { getByText } = render(<BookTile book={bookWithoutImage} />)

    expect(getByText(bookWithoutImage.title)).toBeInTheDocument()
    const args = ImageMock.mock.calls[0][0]
    expect(args.src).toBe('/no_image.jpg')
    expect(args.src).toBe('/no_image.jpg')
    expect(ImageMock).toBeCalledWith(
      {
        src: '/no_image.jpg',
        alt: bookWithoutImage.title,
        width: 300,
        height: 400,
      },
      {},
    )
  })

  it('idが設定されている場合、クリックすると詳細画面へ遷移する', () => {
    const { getByRole } = render(<BookTile book={bookWithImage} />)

    expect(getByRole('link')).toHaveAttribute('href', `/books/${bookWithImage.id}`)
  })
})
