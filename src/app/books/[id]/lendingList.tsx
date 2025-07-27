import UserAvatar from '@/components/userAvatar'
import { isOverdue, toJstFormat } from '@/libs/luxon/utils'
import prisma from '@/libs/prisma/client'

type Props = {
  bookId: number
}

const LendingList = async ({ bookId }: Props) => {
  const lendingHistories = await prisma.lendingHistory
    .findMany({
      where: { bookId: bookId, returnHistory: null },
      include: {
        user: true,
        location: true,
      },
      orderBy: [{ lentAt: 'asc' }],
    })
    .catch((e) => {
      console.error(e)
      return new Error('Book fetch failed')
    })
  if (lendingHistories instanceof Error) {
    return <p>貸出履歴の取得に失敗しました。再読み込みしてみてください。</p>
  }

  if (lendingHistories.length === 0) {
    return <p>現在借りているユーザーはいません</p>
  }

  return (
    <table className="table w-full">
      <tbody>
        {lendingHistories.map((lendingHistory, index) => {
          return (
            <tr className="hover" key={lendingHistory.id}>
              <td className="w-[15rem]">
                <span
                  className={isOverdue(lendingHistory.dueDate) ? 'text-red-400 font-bold' : ''}
                  data-testid={`dueDate-${index}`}
                >
                  {toJstFormat(lendingHistory.dueDate)}
                </span>
              </td>
              <td data-testid={`lendingUser-${index}`}>
                <UserAvatar user={lendingHistory.user} />
              </td>
              <td data-testid={`location-${index}`}>
                <span className="text-sm text-gray-600">
                  {lendingHistory.location?.name || '場所不明'}
                </span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default LendingList
