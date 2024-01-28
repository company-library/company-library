import UserAvatar from '@/components/userAvatar'
import prisma from '@/libs/prisma/client'
import { toJstFormat } from '@/libs/luxon/utils'

type Props = {
  bookId: number
}

const ReturnList = async ({ bookId }: Props) => {
  const returnHistories = await prisma.returnHistory
    .findMany({
      where: { lendingHistory: { bookId: bookId } },
      include: { lendingHistory: { include: { user: true } } },
      orderBy: [{ returnedAt: 'asc' }],
    })
    .catch((e) => {
      console.error(e)
      return new Error('Book fetch failed')
    })
  if (returnHistories instanceof Error) {
    return <div>返却履歴の取得に失敗しました。再読み込みしてみてください。</div>
  }

  return (
    <table className="table w-full">
      <tbody>
        {returnHistories.map((returnHistory, index) => {
          return (
            <tr className="hover" key={returnHistory.lendingHistoryId}>
              <td className="w-[15rem]" data-testid={`returnedDate-${index}`}>
                {toJstFormat(returnHistory.lendingHistory.lentAt)}〜
                {toJstFormat(returnHistory.returnedAt)}
              </td>
              <td data-testid={`returnedUser-${index}`}>
                <UserAvatar user={returnHistory.lendingHistory.user} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default ReturnList
