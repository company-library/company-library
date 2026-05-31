'use client'

import type { FC } from 'react'
import useSWR from 'swr'
import AddBookDiv from '@/app/books/register/addBookDiv'
import RegisterBookDiv from '@/app/books/register/registerBookDiv'
import BookTile from '@/components/bookTile'
import { GOOGLE_BOOK_SEARCH_QUERY, OPENBD_SEARCH_QUERY } from '@/constants'
import fetcher from '@/libs/swr/fetcher'
import type { Book } from '@/models/book'
import { type CustomError, isCustomError } from '@/models/errors'

type SearchedBookProps = {
  isbn: string
  userId: number
}

type SearchedBook = {
  items?: [
    {
      volumeInfo?: {
        title?: string
        description?: string
        subtitle?: string
        imageLinks?: {
          thumbnail?: string
        }
      }
    },
  ]
}

type OpenBDBooks = Array<{
  summary: {
    title?: string
    cover?: string
  }
}>

/**
 * GoogleBooksAPIから取得した書籍情報を表示するコンポーネント
 * @param {string} isbn
 * @param {number} userId
 * @returns {JSX.Element}
 */
const SearchedBook: FC<SearchedBookProps> = ({ isbn, userId }) => {
  const publicBook = usePublicBookData(isbn)
  const companyBook = useCompanyBook(isbn)

  if (companyBook != null) {
    const book = { title: companyBook.title, imageUrl: companyBook.imageUrl }
    return (
      <>
        <FoundBookDiv book={book} />
        <AddBookDiv companyBook={companyBook} userId={userId} />
      </>
    )
  }

  if (publicBook != null) {
    const book = {
      title: publicBook.title,
      description: publicBook.description,
      imageUrl: publicBook.imageUrl,
    }
    const { title, description, imageUrl: thumbnailUrl } = publicBook
    return (
      <>
        <FoundBookDiv book={book} />
        <RegisterBookDiv
          title={title}
          description={description}
          isbn={isbn}
          thumbnailUrl={thumbnailUrl}
          userId={userId}
        />
      </>
    )
  }

  return <p>書籍は見つかりませんでした</p>
}

export default SearchedBook

/** 見つかった書籍を表示するコンポーネント */
const FoundBookDiv = ({ book }: { book: { title: string; imageUrl?: string | null } }) => {
  return (
    <>
      <p>こちらの本でしょうか？</p>
      <div className="my-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
        <BookTile book={book} />
      </div>
    </>
  )
}

/** 登録済みの書籍を取得する */
const useCompanyBook = (isbn: string) => {
  const { data: companyBookData, error } = useSWR<
    | {
        book: Book & { _count: { registrationHistories: number } }
      }
    | CustomError
  >(`/api/books/searchByIsbn?isbn=${isbn}`, fetcher)
  if (error || isCustomError(companyBookData)) {
    console.error(error)
    return null
  }
  const companyBook = companyBookData?.book

  const exists = !!companyBook?._count && companyBook._count.registrationHistories >= 1
  if (!exists) {
    return null
  }

  return companyBook
}

/** 公開されている書籍を取得する */
const usePublicBookData = (isbn: string) => {
  const googleBook = useGoogleBookData(isbn)
  const openbdBook = useOpenBDData(isbn)

  let title = googleBook?.items?.[0].volumeInfo?.title
  let description = googleBook?.items?.[0].volumeInfo?.description
  let thumbnailUrl = googleBook?.items?.[0].volumeInfo?.imageLinks?.thumbnail
  title ??= openbdBook?.[0]?.summary?.title
  description ??= ''
  thumbnailUrl ??= openbdBook?.[0]?.summary?.cover

  if (!title) {
    return null
  }

  return {
    title: title,
    description: description,
    imageUrl: thumbnailUrl,
  }
}

/** GoogleBooks APIから書籍情報を取得する */
const useGoogleBookData = (isbn: string) => {
  const { data: googleBookData } = useSWR(`${GOOGLE_BOOK_SEARCH_QUERY}${isbn}`, fetcher)
  const googleBook: SearchedBook | undefined = googleBookData
  return googleBook
}

/** OpenBD APIから書籍情報を取得する */
const useOpenBDData = (isbn: string) => {
  const { data: openbdBookData } = useSWR(`${OPENBD_SEARCH_QUERY}${isbn}`, fetcher)
  const openbdBook: OpenBDBooks | undefined = openbdBookData
  return openbdBook
}
