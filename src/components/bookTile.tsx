import { FC } from 'react'
import Image from 'next/image'

type BookProps = {
  book: {
    title: string
    imageUrl: string
  }
}

const BookTile: FC<BookProps> = ({ book }) => {
  return (
    <div className="max-w-sm rounded-lg shadow-lg overflow-hidden">
      <Image
        src={book.imageUrl ? book.imageUrl : '/no_image.jpg'}
        alt={book.title}
        width={300}
        height={400}
      />
      <p className="text-sm font-medium p-2">{book.title}</p>
    </div>
  )
}

export default BookTile
