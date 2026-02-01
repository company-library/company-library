import type { Metadata } from 'next'
import UsersClient from '@/app/users/usersClient'
import { readingHistories } from '@/hooks/server/readingHistories'
import prisma from '@/libs/prisma/client'

export const metadata: Metadata = {
  title: '利用者一覧 | company-library',
}

const Users = async () => {
  const users = await prisma.user
    .findMany({ include: { lendingHistories: { include: { returnHistory: true } } } })
    .catch((e) => {
      console.error(e)
      return new Error('User fetch failed')
    })

  if (users instanceof Error) {
    return <div>Error!</div>
  }

  const usersWithCounts = users.map((user) => {
    const { readingBooks, haveReadBooks } = readingHistories(user.lendingHistories)
    return {
      user,
      readingBookCount: readingBooks.length,
      haveReadBookCount: haveReadBooks.length,
    }
  })

  return <UsersClient usersWithCounts={usersWithCounts} />
}

export default Users
