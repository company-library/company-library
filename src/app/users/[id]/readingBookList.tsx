import type { FC } from 'react'
import ReadingBookListClient from '@/app/users/[id]/readingBookListClient'
import prisma from '@/libs/prisma/client'

type ReadingBookListProps = {
  readingBooks: {
    bookId: number
    dueDate: Date
  }[]
}

const ReadingBookList: FC<ReadingBookListProps> = async ({ readingBooks }) => {
  const bookIds = readingBooks.map((book) => book.bookId)
  const books = await prisma.book.findMany({ where: { id: { in: bookIds } } })

  return <ReadingBookListClient books={books} readingBooks={readingBooks} />
}

export default ReadingBookList
