import { FC } from 'react'
import useSWR from 'swr'
import { GOOGLE_BOOK_SEARCH_QUERY } from '@/constants'
import Book from '@/components/book'
import fetcher from '@/libs/swr/fetcher'

type GoogleBookProps = {
  isbn: string
}

type GoogleBook = {
  items: [
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

const GoogleBook: FC<GoogleBookProps> = ({ isbn }) => {
  const { data } = useSWR(`${GOOGLE_BOOK_SEARCH_QUERY}${isbn}`, fetcher)
  const googleBook: GoogleBook = data
  const title = googleBook.items[0].volumeInfo?.title
  const thumbnailUrl = googleBook.items[0].volumeInfo?.imageLinks?.thumbnail

  if (!title || !thumbnailUrl) {
    return (
      <>
        <p>書籍は見つかりませんでした</p>
      </>
    )
  }

  const book = {
    title: googleBook.items[0].volumeInfo?.title ?? '',
    imageUrl: googleBook.items[0].volumeInfo?.imageLinks?.thumbnail ?? '',
  }

  return (
    <>
      <p>こちらの本でしょうか？</p>
      <Book book={book} />
      <button>登録する</button>
    </>
  )
}

export default GoogleBook
