import NavigationBar from '@/components/navigationBar'
import { getServerSession } from 'next-auth'
import prisma from '@/libs/prisma/client'

import '../styles/globals.css'

export const metadata = {
  title: 'company-library',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  const email = session?.user?.email
  const userId = email
    ? await prisma.user.findUnique({ where: { email } }).then((user) => {
        return user?.id
      })
    : undefined

  return (
    <html lang="ja">
      <body>
        <header>
          <NavigationBar userId={userId} />
        </header>
        <main className="max-w-7xl mx-auto mt-8">{children}</main>
      </body>
    </html>
  )
}
