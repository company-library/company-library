'use client'

import { FC } from 'react'
import { addBook } from '@/app/books/register/actions'

type AddBookDivProps = {
  companyBook: {
    id: number
    _count: {
      registrationHistories: number
    }
  }
  userId: number
}

const AddBookDiv: FC<AddBookDivProps> = ({ companyBook, userId }) => {
  const addBookWithArgs = addBook.bind(null, companyBook.id, userId)

  return (
    <>
      <p>
        すでに登録されています
        <br />
        現在の登録冊数：{companyBook._count.registrationHistories}
      </p>
      <form action={addBookWithArgs}>
        <button
          type="submit"
          className="rounded-md my-auto px-3 py-2 bg-gray-400 text-white hover:bg-gray-500"
        >
          追加する
        </button>
      </form>
    </>
  )
}

export default AddBookDiv
