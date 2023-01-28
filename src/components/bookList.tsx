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
  if (books.length === 0) {
    return (
      <p>該当の書籍はありません</p>
    )
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
