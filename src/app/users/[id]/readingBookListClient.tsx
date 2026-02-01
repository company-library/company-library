'use client'

import type { FC } from 'react'
import BookTile from '@/components/bookTile'
import { isOverdue, toJstFormat } from '@/libs/luxon/utils'
import type { Book } from '@/models/book'

type ReadingBookListClientProps = {
  books: Book[]
  readingBooks: {
    bookId: number
    dueDate: Date
  }[]
}

const ReadingBookListClient: FC<ReadingBookListClientProps> = ({ books, readingBooks }) => {
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

export default ReadingBookListClient
