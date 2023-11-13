'use client'

import { FC } from 'react'
import { registerBook } from '@/app/books/register/actions'

type RegisterBookDivProps = {
  title: string
  isbn: string
  thumbnailUrl: string | undefined
  userId: number
}

const RegisterBookDiv: FC<RegisterBookDivProps> = ({ title, isbn, thumbnailUrl, userId }) => {
  const registerBookWithArgs = registerBook.bind(null, title, isbn, thumbnailUrl, userId)

  return (
    <form action={registerBookWithArgs}>
      <button
        type="submit"
        className="rounded-md my-auto px-3 py-2 bg-gray-400 text-white hover:bg-gray-500"
      >
        登録する
      </button>
    </form>
  )
}

export default RegisterBookDiv
