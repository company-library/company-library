import { DateTime } from 'luxon'
import { DATE_FORMAT } from '@/constants'
import UserAvatar from '@/components/userAvatar'
import prisma from '@/libs/prisma/client'

type Props = {
  bookId: number
}

const ReturnList = async ({ bookId }: Props) => {
  const returnHistories = await prisma.returnHistory
    .findMany({
      where: { lendingHistory: { bookId: bookId } },
      include: { lendingHistory: { include: { user: true } } },
    })
    .catch((e) => {
      console.error(e)
      return new Error('Book fetch failed')
    })

  if (returnHistories instanceof Error) {
    return <div>本の取得に失敗しました。再読み込みしてみてください</div>
  }

  if (returnHistories == null) {
    return <div>その本は存在しないようです</div>
  }

  return (
    <div>
      <h2>借りた人</h2>
      <table className="table w-full">
        <tbody>
          {returnHistories.map((lentHistory, index) => {
            return (
              <tr className="hover:hover" key={lentHistory.lendingHistoryId}>
                <td className="w-[15rem]" data-testid={`returnedDate-${index}`}>
                  {DateTime.fromISO(lentHistory.lendingHistory.lentAt.toISOString())
                    .setZone('Asia/Tokyo')
                    .toFormat(DATE_FORMAT)}
                  〜
                  {DateTime.fromISO(lentHistory.returnedAt.toISOString())
                    .setZone('Asia/Tokyo')
                    .toFormat(DATE_FORMAT)}
                </td>
                <td data-testid={`returnedUser-${index}`}>
                  <UserAvatar user={lentHistory.lendingHistory.user} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ReturnList
