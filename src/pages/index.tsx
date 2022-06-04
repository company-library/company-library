import type { NextPage } from 'next'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Layout from '../components/layout'

const Home: NextPage = () => {
  return (
    <Layout title="トップページ | company-library">
      <h1>
        Welcome to <a href="https://nextjs.org">Next.js!</a>
      </h1>

      <div>
        <button onClick={() => signIn()}>Sign in</button>

        <div>
          <Link href="/Users/mongol/dev/company-library/src/pages/private">
            <a>private page</a>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

export default Home
