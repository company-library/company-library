import { render } from '@testing-library/react'
import UserPage from '@/pages/users/[id]'
import { user1 } from '../../__utils__/data/user'

describe('UserDetail page', () => {
  const expectedUser = user1

  const routerMock = { query: { id: expectedUser.id } }
  const useRouterMock = jest
    .spyOn(require('next/router'), 'useRouter')
    .mockReturnValue(routerMock)

  const LayoutMock = jest
    .spyOn(require('@/components/layout'), 'default')
    .mockImplementation((props: any) => {
      return <div>{props.children}</div>
    })

  const UserDetailMock = jest
    .spyOn(require('@/components/user'), 'default')
    .mockReturnValue(<div>userDetail</div>)

  it('ユーザー情報が表示される', () => {
    render(<UserPage />)

    // @ts-expect-error
    expect(LayoutMock.mock.calls[0][0]['title']).toBe(`利用者情報 | company-library`)
    // @ts-expect-error
    expect(UserDetailMock.mock.calls[0][0]['id']).toBe(expectedUser.id)
  })

  it('クエリにidがない場合は、HTTPステータスコード400のエラーページが表示される', () => {
    useRouterMock.mockReturnValueOnce({ query: {} })

    const { getByText } = render(<UserPage />)

    expect(getByText('400')).toBeInTheDocument()
  })
})
