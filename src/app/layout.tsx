import NavigationBar from '@/app/navigationBar'

import '../styles/globals.css'

export const metadata = {
  title: 'company-library',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="w-screen">
        <header>
          <NavigationBar />
        </header>
        <main className="max-w-7xl mx-auto mt-8">{children}</main>
        <footer className="mt-10" />
      </body>
    </html>
  )
}
