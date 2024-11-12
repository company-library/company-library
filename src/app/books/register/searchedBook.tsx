'use client'

import AddBookDiv from '@/app/books/register/addBookDiv'
import RegisterBookDiv from '@/app/books/register/registerBookDiv'
import BookTile from '@/components/bookTile'
import { GOOGLE_BOOK_SEARCH_QUERY, OPENBD_SEARCH_QUERY } from '@/constants'
import fetcher from '@/libs/swr/fetcher'
import type { Book } from '@/models/book'
import { type CustomError, isCustomError } from '@/models/errors'
import type { FC } from 'react'
import useSWR from 'swr'

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
const SearchedBook: FC<SearchedBookProps> = ({ isbn, userId }) => {
  const { data: googleBookData, error: googleBookError } = useSWR(`${GOOGLE_BOOK_SEARCH_QUERY}${isbn}`, fetcher)
  const googleBook: SearchedBook | undefined = googleBookData
  const title = googleBook?.items?.[0].volumeInfo?.title
  const thumbnailUrl = googleBook?.items?.[0].volumeInfo?.imageLinks?.thumbnail

  const { data: companyBookData, error: companyBookError } = useSWR<
    | {
        book: Book & { _count: { registrationHistories: number } }
      }
    | CustomError
  >(`/api/books/searchByIsbn?isbn=${isbn}`, fetcher)
  if (companyBookError || isCustomError(companyBookData)) {
    console.error(companyBookError)
    return <div>Error!</div>
  }
  const companyBook = companyBookData?.book

  if (!title) {
    const { data: openBdData, error: openBdError } = useSWR(`${OPENBD_SEARCH_QUERY}${isbn}`, fetcher)
    if (openBdError) {
      console.error(openBdError)
      return <div>Error!</div>
    }
    if (!openBdData || openBdData.length === 0) {
      console.error('Both Google Books API and openBD API failed to fetch book information')
      return <div>書籍は見つかりませんでした</div>
    }
    const openBdBook = {
      title: openBdData[0].summary.title,
      imageUrl: openBdData[0].summary.cover,
    }
    return (
      <>
        <p>こちらの本でしょうか？</p>
        <div className="my-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          <BookTile book={openBdBook} />
        </div>
        {!!companyBook?._count && companyBook._count.registrationHistories >= 1 ? (
          <AddBookDiv companyBook={companyBook} userId={userId} />
        ) : (
          <RegisterBookDiv title={openBdBook.title} isbn={isbn} thumbnailUrl={openBdBook.imageUrl} userId={userId} />
        )}
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
