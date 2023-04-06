import { NextPage } from 'next'
import Layout from '@/components/layout'
import { useGetBookQuery } from '@/generated/graphql.client'
import { useRouter } from 'next/router'
import BookDetail from '@/components/bookDetail'

const BookDetailPage: NextPage = () => {
  const router = useRouter()
  const bookId = Number(router.query.id)

  const [result] = useGetBookQuery({ variables: { id: bookId } })

  if (result.fetching || result.error || !result.data) {
    return (
      <Layout title={'詳細 | company-library'}>
        {result.fetching ? <div>Loading...</div> : <div>Error!</div>}
      </Layout>
    )
  }

  const book = result.data.books[0]
  console.log(book)

  return (
    <Layout title={`${book.title} | company-library`}>
      <BookDetail book={book} />
    </Layout>
  )
}

export default BookDetailPage
