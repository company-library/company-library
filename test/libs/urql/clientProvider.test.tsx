import { render } from '@testing-library/react'
import ClientProvider from '@/libs/urql/clientProvider'
import { createClient } from 'urql'

jest.mock('urql')

describe('ClientProvider component', () => {
  const graphqlEndpoint = 'https://endpoint'
  process.env.NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT = graphqlEndpoint

  const expectedIdToken = 'idToken'
  jest
    .spyOn(require('next-auth/react'), 'useSession')
    .mockReturnValue({ data: { idToken: expectedIdToken } })
  const createClientMock = (createClient as jest.Mock).mockReturnValue({})

  it('エンドポイントとJWTを使ってclientを作成する', () => {
    render(
      <ClientProvider>
        <div>test</div>
      </ClientProvider>,
    )

    const args = createClientMock.mock.calls[0][0]
    expect(args.url).toBe(`${graphqlEndpoint}/v1/graphql`)
    expect(args.fetchOptions()).toStrictEqual({
      headers: {
        authorization: `Bearer ${expectedIdToken}`,
      },
    })
  })

  it.todo('作成したclientをProviderで保持する')
})
