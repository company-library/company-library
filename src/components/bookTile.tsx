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
    <div className="max-w-xs rounded-lg shadow-lg overflow-hidden">
      <div>
        <Image
          src={book.imageUrl ? book.imageUrl : '/no_image.jpg'}
          layout="fill"
          alt={book.title}
        />
      </div>
      <p className="text-sm font-medium p-2">{book.title}</p>
    </div>
  )
}

export default BookTile
