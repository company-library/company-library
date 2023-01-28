import { FC } from 'react'
import useSWR from 'swr'
import { GOOGLE_BOOK_SEARCH_QUERY } from '@/constants'
import BookTile from '@/components/bookTile'
import fetcher from '@/libs/swr/fetcher'
import {
  useGetBookByIsbnQuery,
  useInsertBookMutation,
  useInsertRegistrationHistoryMutation,
} from '@/generated/graphql.client'
import { useRouter } from 'next/router'
import { useCustomUser } from '@/hooks/useCustomUser'

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
  const router = useRouter()
  const { user } = useCustomUser()
  const { data } = useSWR(`${GOOGLE_BOOK_SEARCH_QUERY}${isbn}`, fetcher)
  const googleBook: GoogleBook | undefined = data
  const title = googleBook?.items?.[0].volumeInfo?.title
  const thumbnailUrl = googleBook?.items?.[0].volumeInfo?.imageLinks?.thumbnail

  const [companyBookResult] = useGetBookByIsbnQuery({ variables: { isbn: isbn } })
  const companyBook = companyBookResult.data?.books?.[0]

  const [, insertBook] = useInsertBookMutation()
  const [, insertRegistrationHistory] = useInsertRegistrationHistoryMutation()
  const registerBook = (userId: number) => {
    if (title) {
      insertBook({ title: title, isbn: isbn, imageUrl: thumbnailUrl }).then((bookResult) => {
        if (bookResult.error) {
          console.error('book insert error: ', bookResult.error)
          return
        }

        const bookId = bookResult.data?.insert_books_one?.id
        if (bookId) {
          insertRegistrationHistory({ bookId, userId }).then(async (registrationResult) => {
            if (registrationResult.error) {
              console.error('registration insert error: ', registrationResult.error)
              return
            }

            await fetch(`/api/books/notifyRegistration/${bookId}`)
            console.warn(bookId)
            await router.push(`/books/${bookId}`)
          })
        }
      })
    }
  }
  const addBook = (bookId: number, userId: number) => {
    insertRegistrationHistory({ bookId, userId }).then(async (registrationResult) => {
      if (registrationResult.error) {
        console.error('registration insert error: ', registrationResult.error)
        return
      }
      await router.push(`/books/${bookId}`)
    })
  }

  if (!user?.id) {
    return (
      <>
        <p>ユーザーは見つかりませんでした</p>
      </>
    )
  }

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
            現在の登録冊数：{companyBook.registrationHistories.length}
          </p>
          <button
            className="rounded-md my-auto px-3 py-2 bg-gray-400 text-white hover:bg-gray-500"
            onClick={() => addBook(companyBook.id, user.id)}
          >
            追加する
          </button>
        </>
      ) : (
        <button
          className="rounded-md my-auto px-3 py-2 bg-gray-400 text-white hover:bg-gray-500"
          onClick={() => registerBook(user.id)}
        >
          登録する
        </button>
      )}
    </>
  )
}

export default GoogleBook
