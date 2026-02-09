import BookList from '@/app/users/[id]/bookList'
import { getUserPageData } from '@/app/users/[id]/pageLogic'
import ReadingBookList from '@/app/users/[id]/readingBookList'
import UserPageClient from '@/app/users/[id]/userPageClient'

export const generateMetadata = async (props: UserPageProps) => {
  const params = await props.params
  const result = await getUserPageData(params)

  if (result instanceof Error) {
    return { title: '利用者情報 | company-library' }
  }

  return {
    title: `${result.user.name} | company-library`,
  }
}

type UserPageProps = {
  params: Promise<{
    id: string
  }>
}

const UserPage = async (props: UserPageProps) => {
  const params = await props.params
  const result = await getUserPageData(params)

  if (result instanceof Error) {
    return <div>Error!</div>
  }

  const { user, readingBooksCount, haveReadBooksCount, readingBooks, haveReadBooks } = result

  return (
    <UserPageClient
      userName={user.name}
      readingBooksCount={readingBooksCount}
      haveReadBooksCount={haveReadBooksCount}
      readingBookListSection={<ReadingBookList readingBooks={readingBooks} />}
      bookListSection={<BookList bookIds={haveReadBooks.map((b) => b.bookId)} />}
    />
  )
}

export default UserPage
