import { FC } from 'react'
import useSWR from 'swr'
import { GOOGLE_BOOK_SEARCH_QUERY } from '@/constants'
import BookTile from '@/components/book'
import fetcher from '@/libs/swr/fetcher'

type GoogleBookProps = {
  isbn: string
}

type GoogleBook = {
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

const GoogleBook: FC<GoogleBookProps> = ({ isbn }) => {
  const { data } = useSWR(`${GOOGLE_BOOK_SEARCH_QUERY}${isbn}`, fetcher)
  const googleBook: GoogleBook | undefined = data
  const title = googleBook?.items?.[0].volumeInfo?.title
  const thumbnailUrl = googleBook?.items?.[0].volumeInfo?.imageLinks?.thumbnail

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
      <button className="rounded-md my-auto px-3 py-2 bg-gray-400 text-white hover:bg-gray-500">
        登録する
      </button>
    </>
  )
}

export default GoogleBook
