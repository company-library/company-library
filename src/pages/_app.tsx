import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import ClientProvider from '@/libs/urql/clientProvider'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <ClientProvider>
        <Component {...pageProps} />
      </ClientProvider>
    </SessionProvider>
  )
}

export default MyApp
