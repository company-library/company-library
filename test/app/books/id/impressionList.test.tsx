import { render, screen } from '@testing-library/react'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'
import { lendableBook } from '../../../__utils__/data/book'

describe('ImpressionList component', () => {
  const ImpressionListComponent = require('@/app/books/[id]/impressionList').default

  const prismaImpressionsMock = prismaMock.impression.findMany
  const expectedImpressions = [
    {
      id: 2,
      impression: '興味深い本でした',
      createdAt: new Date('2022-11-01T10:00:00+09:00'),
      updatedAt: new Date('2022-11-01T10:00:00+09:00'),
      user: { id: 2, name: 'user02' },
    },
    {
      id: 1,
      impression: '本の感想です。\n面白かったです。',
      createdAt: new Date('2022-10-30T10:00:00+09:00'),
      updatedAt: new Date('2022-10-31T10:00:00+09:00'),
      user: { id: 1, name: 'user01' },
    },
    {
      id: 3,
      impression: '感想',
      createdAt: new Date('2022-10-20T10:00:00+09:00'),
      updatedAt: new Date('2022-10-21T10:00:00+09:00'),
      user: { id: 3, name: 'user03' },
    },
  ]

  it('本の感想を更新日の新しい順に表示する', async () => {
    // @ts-ignore
    prismaImpressionsMock.mockResolvedValueOnce(expectedImpressions)

    render(await ImpressionListComponent({ bookId: lendableBook.id }))

    expect(prismaImpressionsMock.mock.calls[0][0]?.orderBy).toStrictEqual([{ updatedAt: 'desc' }])
    expect(screen.getByTestId(`postedDate-${0}`).textContent).toBe('2022/11/01')
    expect(screen.getByTestId(`postedUser-${0}`).textContent).toBe('u')
    expect(screen.getByTestId(`impression-${0}`).textContent).toBe('興味深い本でした')
    expect(screen.getByTestId(`postedDate-${1}`).textContent).toBe('2022/10/31')
    expect(screen.getByTestId(`postedUser-${1}`).textContent).toBe('u')
    expect(screen.getByTestId(`impression-${1}`).textContent).toBe(
      '本の感想です。\n面白かったです。',
    )
    expect(screen.getByTestId(`postedDate-${2}`).textContent).toBe('2022/10/21')
    expect(screen.getByTestId(`postedUser-${2}`).textContent).toBe('u')
    expect(screen.getByTestId(`impression-${2}`).textContent).toBe('感想')
  })

  it('感想は、改行を反映して表示する', async () => {
    // @ts-ignore
    prismaImpressionsMock.mockResolvedValueOnce(expectedImpressions)

    render(await ImpressionListComponent({ bookId: lendableBook.id }))

    expect(screen.getByTestId(`impression-${0}`)).toHaveClass('whitespace-pre-wrap')
    expect(screen.getByTestId(`impression-${1}`)).toHaveClass('whitespace-pre-wrap')
    expect(screen.getByTestId(`impression-${2}`)).toHaveClass('whitespace-pre-wrap')
  })

  it('返却履歴の取得時にエラーが発生した場合、エラーメッセージが表示される', async () => {
    const expectedError = new Error('DBエラー')
    prismaImpressionsMock.mockRejectedValueOnce(expectedError)
    console.error = jest.fn()

    render(await ImpressionListComponent({ bookId: lendableBook.id }))

    expect(
      screen.getByText('感想の取得に失敗しました。再読み込みしてみてください。'),
    ).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectedError)
  })
})
