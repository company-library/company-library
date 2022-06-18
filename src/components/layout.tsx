import Head from 'next/head'
import { FC } from 'react'
import NavigationBar from '@/components/navigationBar'

type LayoutProps = {
  title: string
}

const Layout: FC<LayoutProps> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <NavigationBar />
      </header>
      <main>{children}</main>
    </>
  )
}

export default Layout
