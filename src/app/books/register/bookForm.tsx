'use client'

import { ChangeEvent, FC, useState } from 'react'
import { formatForSearch } from '@/utils/stringUtils'
import SearchedBook from '@/app/books/register/searchedBook'

const BookForm: FC = () => {
  const [isbn, setIsbn] = useState('')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formattedIsbn = formatForSearch(event.target.value.replace(/[-ー]/g, ''))
    setIsbn(formattedIsbn)
  }

  return (
    <>
      <form className="mb-6">
        <label>
          ISBN（13桁）を入力してください
          <input
            type="text"
            onChange={handleChange}
            className="mt-1 block w-72 rounded-md border-2 border-gray-300 shadow-sm"
            defaultValue="9784"
          />
        </label>
      </form>

      {isbn.length === 13 && <SearchedBook isbn={isbn} />}
    </>
  )
}

export default BookForm
