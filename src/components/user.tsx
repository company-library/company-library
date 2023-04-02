import { FC } from 'react'
import { useGetUserByIdQuery } from '@/generated/graphql.client'
import Error from 'next/error'
import BookList from '@/components/bookList'

type UserProps = {
  id: number
}

const User: FC<UserProps> = ({ id }) => {
  const [result] = useGetUserByIdQuery({ variables: { id: id } })
  console.log(result)
  if (result.fetching || result.error || !result.data) {
    if (result.error) {
      console.error(result.error)
    }
    return <>{result.fetching ? <div>Loading...</div> : <Error statusCode={500} />}</>
  }

  const user = result.data.users_by_pk
  if (!user) {
    return <Error statusCode={404} />
  }

  const lendingHistories = user.lendingHistories
    .map((h) => {
      return {
        bookId: h.bookId,
        isReturned: (h.returnHistories_aggregate?.aggregate?.count ?? 0) > 0,
      }
    })
    .reduce<Array<{ bookId: number; isReturned: boolean }>>((acc, obj) => {
      return acc.some((a) => a.bookId === obj.bookId && a.isReturned === obj.isReturned)
        ? acc
        : [...acc, obj]
    }, [])

  const readingBooks = lendingHistories.filter((h) => !h.isReturned)
  const haveReadBooks = lendingHistories.filter((h) => h.isReturned)
  return (
    <>
      <h1 className="text-3xl mb-8">{user.name}さんの情報</h1>
      <h2 className="text-xl mb-2">現在読んでいる書籍({readingBooks.length}冊)</h2>
      <div className="mb-6">
        <BookList ids={readingBooks.map((h) => h.bookId)} />
      </div>
      <h2 className="text-xl mb-2">今まで読んだ書籍({haveReadBooks.length}冊)</h2>
      <div>
        <BookList ids={haveReadBooks.map((h) => h.bookId)} />
      </div>
    </>
  )
}

export default User
