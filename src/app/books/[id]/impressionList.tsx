import UserAvatar from '@/components/userAvatar'
import prisma from '@/libs/prisma/client'
import { toJstFormat } from '@/libs/luxon/utils'

type Props = {
  bookId: number
}

const ImpressionList = async ({ bookId }: Props) => {
  const recentImpressions = await prisma.impression
    .findMany({
      where: { bookId: bookId },
      include: { user: true },
      orderBy: [{ updatedAt: 'desc' }],
    })
    .catch((e) => {
      console.error(e)
      return new Error('Book fetch failed')
    })
  if (recentImpressions instanceof Error) {
    return <div>感想の取得に失敗しました。再読み込みしてみてください。</div>
  }

  return (
    <table className="table w-full">
      <tbody>
        {recentImpressions.map((impression, index) => {
          return (
            <tr className="hover" key={impression.id}>
              <td className="w-[15rem]" data-testid={`postedDate-${index}`}>
                {toJstFormat(impression.updatedAt)}
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
  )
}

export default ImpressionList
