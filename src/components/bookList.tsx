import { FC } from 'react'
import { useGetBooksByIdsQuery } from '@/generated/graphql.client'
import BookTile from '@/components/bookTile'

type BookListProps = {
  ids: number[]
}
const BookList: FC<BookListProps> = ({ ids }) => {
  const [result] = useGetBooksByIdsQuery({ variables: { ids: ids } })
  if (result.fetching || result.error || !result.data) {
    if (result.error) {
      console.error(result.error)
    }
    return (
      <>
        {result.fetching ? <div>Loading...</div> : <div>Error!</div>}
      </>
    )
  }

  const books = result.data.books
  return (
    <>
      {books.map((book) => <BookTile key={book.id} book={book} />)}
    </>
  )
}

export default BookList
