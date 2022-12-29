import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Error from 'next/error'
import Layout from '@/components/layout'
import User from '@/components/user'

const UserPage: NextPage = () => {
  const router = useRouter()
  if (!router.query.id) {
    return <Error statusCode={400} />
  }

  const id = Array.isArray(router.query.id) ? parseInt(router.query.id[0]) : parseInt(router.query.id)
  return (
    <Layout title="利用者情報 | company-library">
      <User id={id} />
    </Layout>
  )
}

export default UserPage
