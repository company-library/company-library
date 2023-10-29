'use client'

import { FC } from 'react'
import useSWR from 'swr'
import { GOOGLE_BOOK_SEARCH_QUERY } from '@/constants'
import BookTile from '@/components/bookTile'
import { Book } from '@/models/book'
import { CustomError, isCustomError } from '@/models/errors'
import fetcher from '@/libs/swr/fetcher'
import { registerBook } from '@/app/books/register/actions'

type GoogleBookProps = {
  isbn: string
}

type SearchedBook = {
  items?: [
    {
      volumeInfo?: {
        title?: string
        subtitle?: string
        imageLinks?: {
          thumbnail?: string
        }
      }
    },
  ]
}

const SearchedBook: FC<GoogleBookProps> = ({ isbn }) => {
  const { data: googleBookData } = useSWR(`${GOOGLE_BOOK_SEARCH_QUERY}${isbn}`)
  const googleBook: SearchedBook | undefined = googleBookData
  const title = googleBook?.items?.[0].volumeInfo?.title
  const thumbnailUrl = googleBook?.items?.[0].volumeInfo?.imageLinks?.thumbnail

  const { data: companyBookData, error } = useSWR<
    | {
        book: Book & { _count: { registrationHistories: number } }
      }
    | CustomError
  >(`/api/books/searchByIsbn?isbn=${isbn}`, fetcher)
  if (error || isCustomError(companyBookData)) {
    console.error(error)
    return <div>Error!</div>
  }
  const companyBook = companyBookData?.book

  const registerBookWithProps = registerBook.bind(null, title, isbn, thumbnailUlr)

  if (!title || !thumbnailUrl) {
    return (
      <>
        <p>書籍は見つかりませんでした</p>
      </>
    )
  }

  const book = {
    title: title,
    imageUrl: thumbnailUrl,
  }

  return (
    <>
      <p>こちらの本でしょうか？</p>
      <div className="my-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
        <BookTile book={book} />
      </div>
      {companyBook ? (
        <>
          <p>
            すでに登録されています
            <br />
            現在の登録冊数：{companyBook._count.registrationHistories}
          </p>
          <button
            className="rounded-md my-auto px-3 py-2 bg-gray-400 text-white hover:bg-gray-500"
            onClick={() => addBook(companyBook.id)}
          >
            追加する
          </button>
        </>
      ) : (
        <form action={registerBookWithProps}>
          <button
            type="submit"
            className="rounded-md my-auto px-3 py-2 bg-gray-400 text-white hover:bg-gray-500"
          >
            登録する
          </button>
        </form>
      )}
    </>
  )
}

export default SearchedBook
