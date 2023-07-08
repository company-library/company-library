import { SessionProvider } from 'next-auth/react'
import NavigationBar from '@/components/navigationBar'

export const metadata = {
  title: 'company-library',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <SessionProvider>
          <header>
            <NavigationBar />
          </header>
          <main className="max-w-7xl mx-auto mt-8">{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
