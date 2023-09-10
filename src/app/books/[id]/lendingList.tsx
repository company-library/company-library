import UserAvatar from '@/components/userAvatar'
import prisma from '@/libs/prisma/client'
import { isOverdue, toJstFormat } from '@/libs/luxon/utils'

type Props = {
  bookId: number
}

const LendingList = async ({ bookId }: Props) => {
  const lendingHistories = await prisma.lendingHistory
    .findMany({
      where: { bookId: bookId, returnHistory: null },
      include: { user: true },
      orderBy: [{ lentAt: 'asc' }],
    })
    .catch((e) => {
      console.error(e)
      return new Error('Book fetch failed')
    })
  if (lendingHistories instanceof Error) {
    return <div>貸出履歴の取得に失敗しました。再読み込みしてみてください。</div>
  }

  return (
    <table className="table w-full">
      <tbody>
        {lendingHistories.map((lendingHistory, index) => {
          return (
            <tr className="hover:hover" key={lendingHistory.id}>
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
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default LendingList
