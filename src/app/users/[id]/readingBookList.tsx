import BookTile from '@/components/bookTile'
import { isOverdue, toJstFormat } from '@/libs/luxon/utils'
import prisma from '@/libs/prisma/client'
import type { FC } from 'react'

type ReadingBookListProps = {
  readingBooks: {
    bookId: number
    dueDate: Date
  }[]
}

const ReadingBookList: FC<ReadingBookListProps> = async ({ readingBooks }) => {
  const bookIds = readingBooks.map((book) => book.bookId)
  const books = await prisma.book.findMany({ where: { id: { in: bookIds } } })

  if (books.length === 0) {
    return <p>該当の書籍はありません</p>
  }

  return (
    <div className="flex flex-wrap">
      {books.map((book) => {
        const readingBook = readingBooks.find((readingBook) => readingBook.bookId === book.id)

        return (
          <div key={book.id} className="m-10">
            <BookTile book={book} />
            {readingBook && (
              <span
                data-overdue={isOverdue(readingBook.dueDate)}
                className="data-[overdue=true]:text-red-400 data-[overdue=true]:font-bold"
              >
                {toJstFormat(readingBook.dueDate)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ReadingBookList
