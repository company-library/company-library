'use client'

import { type ChangeEvent, type FC, useState } from 'react'
import SearchedBook from '@/app/books/register/searchedBook'
import { formatForSearch } from '@/utils/stringUtils'

type BookFormProps = {
  userId: number
}

/**
 * 書籍登録のための検索フォーム
 * @param {number} userId
 * @returns {JSX.Element}
 * @constructor
 */
const BookForm: FC<BookFormProps> = ({ userId }) => {
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
            className="mt-1 block w-72 rounded-md border-2 border-gray-300 shadow-xs"
            defaultValue="9784"
          />
        </label>
      </form>

      {isbn.length === 13 && <SearchedBook isbn={isbn} userId={userId} />}
    </>
  )
}

export default BookForm
