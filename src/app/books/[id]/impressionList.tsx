import { DateTime } from 'luxon'
import { DATE_FORMAT } from '@/constants'
import UserAvatar from '@/components/userAvatar'
import prisma from '@/libs/prisma/client'

type Props = {
  bookId: number
}

const ImpressionList = async ({ bookId }: Props) => {
  const recentImpressions = await prisma.impression
    .findMany({
      where: { bookId: bookId },
      include: { user: true },
    })
    .catch((e) => {
      console.error(e)
      return new Error('Book fetch failed')
    })

  if (recentImpressions instanceof Error) {
    return <div>本の取得に失敗しました。再読み込みしてみてください</div>
  }

  if (recentImpressions == null) {
    return <div>その本は存在しないようです</div>
  }

  return (
    <div>
      <h2>感想</h2>
      <table className="table w-full">
        <tbody>
          {recentImpressions.map((impression, index) => {
            return (
              <tr className="hover:hover" key={impression.id}>
                <td className="w-[15rem]" data-testid={`postedDate-${index}`}>
                  {DateTime.fromISO(impression.updatedAt.toISOString())
                    .setZone('Asia/Tokyo')
                    .toFormat(DATE_FORMAT)}
                </td>
                <td className="w-[5rem]" data-testid={`postedUser-${index}`}>
                  <UserAvatar user={impression.user} />
                </td>
                <td className="whitespace-pre-wrap" data-testid={`impression-${index}`}>
                  {impression.impression}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ImpressionList
