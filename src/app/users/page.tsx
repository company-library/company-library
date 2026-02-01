import type { Metadata } from 'next'
import { getUsersPageData } from '@/app/users/pageLogic'
import UsersClient from '@/app/users/usersClient'

export const metadata: Metadata = {
  title: '利用者一覧 | company-library',
}

const Users = async () => {
  const result = await getUsersPageData()

  if (result instanceof Error) {
    return <div>Error!</div>
  }

  return <UsersClient usersWithCounts={result} />
}

export default Users
