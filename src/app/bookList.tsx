'use client'

import { useState } from 'react'
import useSWR from 'swr'
import BookTile from '@/components/bookTile'
import { trpc } from '@/libs/trpc/client'

const BookList = () => {
  const { data: locations = [] } = useSWR('location.list', () => trpc.location.list.query())

  const [searchLocation, setSearchLocation] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const { data: books, error } = useSWR(
    ['book.search', searchKeyword, searchLocation],
    ([, q, locationId]) =>
      trpc.book.search.query({ q, locationId: locationId ? Number(locationId) : undefined }),
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
        {error ? (
          <div>Error!</div>
        ) : !books ? (
          <div>Loading...</div>
        ) : (
          books.map((book) => {
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
