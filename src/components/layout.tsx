import Head from 'next/head'
import React, { FC } from 'react'
import OldNavigationBar from '@/components/oldNavigationBar'

type LayoutProps = {
  title: string
  children: React.ReactNode
}

const Layout: FC<LayoutProps> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <OldNavigationBar />
      </header>
      <main className="max-w-7xl mx-auto mt-8">{children}</main>
    </>
  )
}

export default Layout
