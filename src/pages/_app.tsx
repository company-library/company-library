import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { createClient, Provider } from 'urql'

function MyApp({ Component, pageProps }: AppProps) {
  const client = createClient({
    url: 'http://localhost:8080/v1/graphql',
    fetchOptions: () => {
      return {
        headers: {
          'x-hasura-admin-secret': 'myadminsecretkey',
          // Authorization: '',
        },
      }
    },
  })

  return (
    <SessionProvider>
      <Provider value={client}>
        <Component {...pageProps} />
      </Provider>
    </SessionProvider>
  )
}

export default MyApp
