'use client'

import { FC } from 'react'
import useSWR from 'swr'
import { GOOGLE_BOOK_SEARCH_QUERY } from '@/constants'
import BookTile from '@/components/bookTile'
import { Book } from '@/models/book'
import { CustomError, isCustomError } from '@/models/errors'
import fetcher from '@/libs/swr/fetcher'
import AddBookDiv from '@/app/books/register/addBookDiv'
import RegisterBookDiv from '@/app/books/register/registerBookDiv'

type SearchedBookProps = {
  isbn: string
  userId: number
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

/**
 * GoogleBooksAPIから取得した書籍情報を表示するコンポーネント
 * @param {string} isbn
 * @param {number} userId
 * @returns {JSX.Element}
 * @constructor
 */
const SearchedBook: FC<GoogleBookProps> = ({ isbn, userId }) => {
  const { data: googleBookData } = useSWR(`${GOOGLE_BOOK_SEARCH_QUERY}${isbn}`, fetcher)
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

  if (!title) {
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
      {!!companyBook?._count && companyBook._count.registrationHistories >= 1 ? (
        <AddBookDiv companyBook={companyBook} userId={userId} />
      ) : (
        <RegisterBookDiv title={title} isbn={isbn} thumbnailUrl={thumbnailUrl} userId={userId} />
      )}
    </>
  )
}

export default SearchedBook
