import { NextPage } from 'next'
import Layout from '@/components/layout'
import { useGetUsersQuery } from '@/generated/graphql.client'
import UserCard from '@/components/userCard'

const Users: NextPage = () => {
  const [result] = useGetUsersQuery()
  if (result.fetching || result.error || !result.data) {
    if (result.error) {
      console.error(result.error)
    }
    return (
      <Layout title={'利用者一覧 | company-library'}>
        {result.fetching ? <div>Loading...</div> : <div>Error!</div>}
      </Layout>
    )
  }

  const users = result.data.users

  return (
    <Layout title="利用者一覧 | company-library">
      <h1 className="text-3xl mb-8">利用者一覧</h1>
      <div className="grid grid-cols-1 gap6 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => {
          return <UserCard key={user.id} user={user} />
        })}
      </div>
    </Layout>
  )
}

export default Users
