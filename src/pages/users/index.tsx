import { NextPage } from 'next'
import Layout from '@/components/layout'
import { useGetUsersQuery } from '@/generated/graphql.client'
import UserCard from '@/components/userCard'

const Users: NextPage = () => {
  const [result] = useGetUsersQuery()
  if (result.fetching || result.error || !result.data) {
    return (
      <Layout title={'詳細 | company-library'}>
        {result.fetching ? <div>Loading...</div> : <div>Error!</div>}
      </Layout>
    )
  }

  const users = result.data.users

  return (
    <Layout title="利用者一覧 | company-library">
      <div className="grid grid-cols-1 gap6 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => {
          return <UserCard key={user.id} user={user} />
        })}
      </div>
    </Layout>
  )
}

export default Users
