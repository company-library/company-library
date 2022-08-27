import type { NextPage } from 'next'
import Link from 'next/link'
import Layout from '@/components/layout'
import Book from '@/components/book'
import { useGetBooksQuery } from '@/generated/graphql.client'

const Home: NextPage = () => {
  const [result] = useGetBooksQuery()

  return (
    <Layout title="トップページ | company-library">
      <div>
        <Link href="/private">
          <a>private page</a>
        </Link>
      </div>

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
                  <Book book={book} />
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
