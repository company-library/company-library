'use client'

import type { FC } from 'react'
import BookTile from '@/components/bookTile'
import type { Book } from '@/models/book'

type BookListClientProps = {
  books: Book[]
}

const BookListClient: FC<BookListClientProps> = ({ books }) => {
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

export default BookListClient
