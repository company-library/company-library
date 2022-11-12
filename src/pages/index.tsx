import type { NextPage } from 'next'
import Layout from '@/components/layout'
import BookTile from '@/components/bookTile'
import { useGetBooksQuery } from '@/generated/graphql.client'

const Home: NextPage = () => {
  const [result] = useGetBooksQuery()
  if (result.error) {
    console.error(result.error)
  }

  return (
    <Layout title="トップページ | company-library">
      <div>
        <p className="text-4xl">新着</p>
      </div>

      <div className="flex flex-wrap">
        {result.fetching ? (
          <div>Loading...</div>
        ) : result.error || !result.data ? (
          <div>Error!</div>
        ) : (
          result.data.books.map((book) => {
            return (
              <div key={book.id}>
                <div className="m-10">
                  <BookTile book={book} />
                </div>
              </div>
            )
          })
        )}
      </div>
    </Layout>
  )
}

export default Home
