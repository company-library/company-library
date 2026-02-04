import type { FC } from 'react'
import BookListClient from '@/app/users/[id]/bookListClient'
import prisma from '@/libs/prisma/client'

type BookListProps = {
  bookIds: number[]
}

const BookList: FC<BookListProps> = async ({ bookIds }) => {
  const books = await prisma.book.findMany({ where: { id: { in: bookIds } } })

  return <BookListClient books={books} />
}

export default BookList
