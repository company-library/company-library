import type { GetServerSideProps, NextPage } from 'next'
import styles from '../styles/Home.module.css'
import { getSession } from 'next-auth/react'
import { Session } from 'next-auth'
import Layout from '../components/layout'

type PrivateProps = {
  session: Session | null
}

const Private: NextPage<PrivateProps> = ({ session }) => {
  return (
    <Layout title="プライベートページ | company-library">
      <h1 className={styles.title}>Welcome to Private Page</h1>
      <p>Hello! {session?.user?.name}</p>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession({ req: ctx.req })
  console.log(session)
  return { props: { session } }
}

export default Private
