import NavigationBar from '@/components/navigationBar'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

import '../styles/globals.css'

export const metadata = {
  title: 'company-library',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const userId = session?.customUser.id

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
