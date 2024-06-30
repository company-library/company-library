import BookTile from '@/components/bookTile'
import prisma from '@/libs/prisma/client'
import type { FC } from 'react'

type BookListProps = {
  bookIds: number[]
}

const BookList: FC<BookListProps> = async ({ bookIds }) => {
  const books = await prisma.book.findMany({ where: { id: { in: bookIds } } })

  if (books.length === 0) {
    return <p>該当の書籍はありません</p>
  }

  return (
    <div className="flex flex-wrap">
      {books.map((book) => {
        return (
          <div key={book.id} className="m-10">
            <BookTile book={book} />
          </div>
        )
      })}
    </div>
  )
}

export default BookList
