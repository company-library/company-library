import React, { FC } from 'react'
import { useSession } from 'next-auth/react'
import { createClient, Provider } from 'urql'

type ClientProviderProps = {
  children: React.ReactNode
}

const ClientProvider: FC<ClientProviderProps> = ({ children }) => {
  const { data: session } = useSession()
  const idToken = session?.idToken

  const graphqlEndpoint = process.env.NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT ?? ''

  const client = createClient({
    url: `${graphqlEndpoint}/v1/graphql`,
    fetchOptions: () => {
      return {
        headers: {
          authorization: `Bearer ${idToken}`,
        },
      }
    },
  })

  return <Provider value={client}>{children}</Provider>
}

export default ClientProvider
