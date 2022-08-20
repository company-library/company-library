import { GraphQLClient } from 'graphql-request'
import { getSdk } from '@/generated/graphql'

const graphqlEndpoint = process.env.NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT ?? ''
const adminSecret = process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? ''

export const sdk = () => {
  const client = new GraphQLClient(`${graphqlEndpoint}/v1/graphql`, {
    headers: { 'x-hasura-admin-secret': adminSecret },
  })
  return getSdk(client)
}
