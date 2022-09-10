import { FC } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type BookProps = {
  book: {
    id: number
    title: string
    imageUrl?: string | null | undefined
  }
}

const Book: FC<BookProps> = ({ book }) => {
  return (
    <Link href={`/books/${book.id}`}>
      <div className="cursor-pointer max-w-sm rounded-lg shadow-lg overflow-hidden hover:shadow-2xl ">
        <Image
          src={book.imageUrl ? book.imageUrl : '/no_image.jpg'}
          alt={book.title}
          width={128}
          height={200}
        />
        <p className="text-sm font-medium p-2">{book.title}</p>
      </div>
    </Link>
  )
}

export default Book
