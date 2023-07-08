import prisma from '@/libs/prisma/client'

type BookDetailPageParams = {
  params: {
    id: number
  }
}

const BookDetailPage = async ({ params }: BookDetailPageParams) => {
  const bookId = Number(params.id)
  const book = await prisma.book.findUnique({ where: { id: bookId } }).catch((e) => {
    console.error(e)
    return new Error('Book fetch failed')
  })

  if (book instanceof Error) {
    return <div>Error!</div>
  }

  if (book == null) {
    return <div>その本は存在しないようです</div>
  }

  return (
    <div>
      <p>{bookId}</p>
      <p>{book.id}</p>
      <p>{book.title}</p>
      <p>{book.imageUrl}</p>
    </div>
  )
}

export default BookDetailPage
