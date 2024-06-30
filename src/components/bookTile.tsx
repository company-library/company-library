import Image from 'next/image'
import Link from 'next/link'
import type { FC } from 'react'

type BookProps = {
  book: {
    id?: number
    title: string
    imageUrl?: string | null | undefined
  }
}

const BookTile: FC<BookProps> = ({ book }) => {
  return book.id ? (
    <Link href={`/books/${book.id}`} className="cursor-pointer hover:shadow-2xl">
      <Tile book={book} />
    </Link>
  ) : (
    <Tile book={book} />
  )
}

export default BookTile

const Tile: FC<BookProps> = ({ book }) => {
  return (
    <div className="w-[300px] rounded-lg shadow-lg">
      <div className="h-[400px] overflow-hidden">
        <Image
          src={book.imageUrl ? book.imageUrl : '/no_image.jpg'}
          alt={book.title}
          width={300}
          height={400}
          data-testid="bookImg"
        />
      </div>
      <p className="text-sm font-medium p-2 truncate">{book.title}</p>
    </div>
  )
}
