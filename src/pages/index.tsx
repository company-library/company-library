import type { NextPage } from 'next'
import Link from 'next/link'
import Layout from '@/components/layout'
import BookTile from '@/components/bookTile'
import { useGetBooksQuery } from '@/generated/graphql.client'
import { useState } from 'react'

const Home: NextPage = () => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [result] = useGetBooksQuery({ variables: { keyword: `%${searchKeyword}%` } })
  if (result.error) {
    console.error(result.error)
  }

  return (
    <Layout title="トップページ | company-library">
      <div>
        <Link href="/private">
          <a>private page</a>
        </Link>
      </div>

      <div>
        <form>
          <div className="relative">
            <input
              type="search"
              className="block p-4 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:border-blue-500"
              placeholder="書籍のタイトルで検索"
              onChange={(event) => setSearchKeyword(event.target.value)}
            />
          </div>
        </form>
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
