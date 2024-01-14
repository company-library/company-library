'use client'

import BookTile from '@/components/bookTile'
import useSWR from 'swr'
import fetcher from '@/libs/swr/fetcher'
import { useState } from 'react'
import { Book } from '@/models/book'
import { CustomError, isCustomError } from '@/models/errors'

// Next.jsでメタデータを設定した場合のテストに問題があるようなので、一旦コメントアウト
// https://github.com/vercel/next.js/issues/47299#issuecomment-1477912861
// export const metadata: Metadata = {
//   title: 'トップページ | company-library',
// }

const Home = () => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const { data, error } = useSWR<{ books: Book[] } | CustomError>(
    `/api/books/search?q=${searchKeyword}`,
    fetcher,
  )
  if (error) {
    console.error(error)
  }

  return (
    <div>
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
        {!data ? (
          <div>Loading...</div>
        ) : error || isCustomError(data) ? (
          <div>Error!</div>
        ) : (
          data.books.map((book) => {
            return (
              <div key={book.id} className="mx-2.5 mt-10">
                <BookTile book={book} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Home
