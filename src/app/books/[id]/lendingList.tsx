import { DateTime } from 'luxon'
import { DATE_FORMAT } from '@/constants'
import UserAvatar from '@/components/userAvatar'
import prisma from '@/libs/prisma/client'

type Props = {
  bookId: number
}

const LendingList = async ({ bookId }: Props) => {
  const lendingHistories = await prisma.lendingHistory
    .findMany({
      where: { bookId: bookId, returnHistory: null },
      include: { user: true },
    })
    .catch((e) => {
      console.error(e)
      return new Error('Book fetch failed')
    })

  if (lendingHistories instanceof Error) {
    return <div>本の取得に失敗しました。再読み込みしてみてください</div>
  }

  if (lendingHistories == null) {
    return <div>その本は存在しないようです</div>
  }

  return (
    <div>
      <h2>借りている人</h2>
      <table className="table w-full">
        <tbody>
          {lendingHistories.map((lendingHistory, index) => {
            const dueDate = DateTime.fromISO(lendingHistory.dueDate.toISOString())
            const isOver = dueDate.diff(DateTime.now(), 'days').days <= -1

            return (
              <tr className="hover:hover" key={lendingHistory.id}>
                <td className="w-[15rem]">
                  <span
                    className={isOver ? 'text-red-400 font-bold' : ''}
                    data-testid={`dueDate-${index}`}
                  >
                    {dueDate.setZone('Asia/Tokyo').toFormat(DATE_FORMAT)}
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
    </div>
  )
}

export default LendingList
