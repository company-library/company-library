import { render, screen } from '@testing-library/react'
import { prismaMock } from '../../__utils__/libs/prisma/singleton'

describe('users page', () => {
  const user = {
    id: 1,
    name: 'test user',
    email: 'test@example.com',
    imageUrl: 'https://example.com/users/1/image',
    createdAt: new Date('2023-01-01'),
  }
  prismaMock.users.findMany.mockResolvedValue([user])

  const UserPage = require('@/app/users/page').default

  it('利用者一覧が表示される', async () => {
    render(await UserPage())

    const heading = await screen.findByRole('heading')
    expect(heading).toHaveTextContent('利用者一覧')

    // expect().toBe('利用者一覧 | company-library')
    // expect(getByText('利用者一覧')).toBeInTheDocument()
    // expect(getByText(user1.name)).toBeInTheDocument()
    // expect(getByText(user2.name)).toBeInTheDocument()
  })

  // it.skip('利用者一覧の読み込みに失敗した場合、「Error!」と表示される', () => {
  //   const expectErrorMsg = 'query has errored!'
  //   console.error = jest.fn()
  //   findUsersMock.mockRejectedValueOnce(new Error(expectErrorMsg))
  //   const { getByText } = render(<UsersPage />)
  //   expect(getByText('Error!')).toBeInTheDocument()
  //   expect(console.error).toBeCalledWith(expectErrorMsg)
  // })
})
