import BookList from '@/app/users/[id]/bookList'
import ReadingBookList from '@/app/users/[id]/readingBookList'
import UserPageClient from '@/app/users/[id]/userPageClient'
import { readingHistories } from '@/hooks/server/readingHistories'
import prisma from '@/libs/prisma/client'

export const generateMetadata = async (props: UserPageProps) => {
  const params = await props.params
  const id = Number(params.id)
  if (Number.isNaN(id)) {
    return { title: '利用者情報 | company-library' }
  }

  const user = await prisma.user
    .findUnique({
      where: { id },
      select: { name: true },
    })
    .catch((e) => {
      console.error(e)
      return new Error('User fetch failed')
    })
  if (user instanceof Error || !user) {
    return { title: '利用者情報 | company-library' }
  }

  return {
    title: `${user.name} | company-library`,
  }
}

type UserPageProps = {
  params: Promise<{
    id: string
  }>
}

const UserPage = async (props: UserPageProps) => {
  const params = await props.params
  const id = Number(params.id)
  if (Number.isNaN(id)) {
    return <div>Error!</div>
  }

  const user = await prisma.user
    .findUnique({
      where: { id },
      include: { lendingHistories: { include: { returnHistory: true } } },
    })
    .catch((e) => {
      console.error(e)
      return new Error('User fetch failed')
    })
  if (user instanceof Error || !user) {
    return <div>Error!</div>
  }

  const { readingBooks, haveReadBooks } = readingHistories(user.lendingHistories)
  return (
    <UserPageClient
      userName={user.name}
      readingBooksCount={readingBooks.length}
      haveReadBooksCount={haveReadBooks.length}
      readingBookListSection={<ReadingBookList readingBooks={readingBooks} />}
      bookListSection={<BookList bookIds={haveReadBooks.map((b) => b.bookId)} />}
    />
  )
}

export default UserPage
