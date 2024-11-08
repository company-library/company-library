import BookList from '@/app/users/[id]/bookList'
import ReadingBookList from '@/app/users/[id]/readingBookList'
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
    <>
      <h1 className="text-3xl">{user.name}さんの情報</h1>
      <div className="mt-8">
        <h2 className="text-xl">現在読んでいる書籍({readingBooks.length}冊)</h2>
        <div className="mt-2">
          <ReadingBookList readingBooks={readingBooks} />
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-xl">今まで読んだ書籍({haveReadBooks.length}冊)</h2>
        <div className="mt-2">
          <BookList bookIds={haveReadBooks.map((b) => b.bookId)} />
        </div>
      </div>
    </>
  )
}

export default UserPage
