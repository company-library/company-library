'use client'

import { useState } from 'react'
import useSWR from 'swr'
import BookTile from '@/components/bookTile'
import fetcher from '@/libs/swr/fetcher'
import type { Book } from '@/models/book'
import { type CustomError, isCustomError } from '@/models/errors'

const BookList = () => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const { data, error } = useSWR<{ books: Book[] } | CustomError>(
    `/api/books/search?q=${searchKeyword}`,
    fetcher,
  )
  if (error) {
    console.error(error)
  }

  return (
    <>
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
    </>
  )
}

export default BookList
