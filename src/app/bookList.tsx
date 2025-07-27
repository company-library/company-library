'use client'

import { useState } from 'react'
import useSWR from 'swr'
import BookTile from '@/components/bookTile'
import fetcher from '@/libs/swr/fetcher'
import type { Book } from '@/models/book'
import { type CustomError, isCustomError } from '@/models/errors'

type Location = {
  id: number
  name: string
}

const BookList = () => {
  const [searchLocation, setSearchLocation] = useState('')
  const { data: locationsData } = useSWR<{ locations: Location[] } | CustomError>(
    '/api/locations',
    fetcher,
  )
  const locations = isCustomError(locationsData) ? [] : locationsData?.locations || []

  const [searchKeyword, setSearchKeyword] = useState('')
  const { data, error } = useSWR<{ books: Book[] } | CustomError>(
    `/api/books/search?q=${searchKeyword}&locationId=${searchLocation}`,
    fetcher,
  )
  if (error) {
    console.error(error)
  }

  return (
    <>
      <div>
        <form className="flex gap-4">
          <div>
            <select className="select" onChange={(e) => setSearchLocation(e.target.value)}>
              <option value="">全ての保管場所</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <input
              type="search"
              className="input w-full"
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
