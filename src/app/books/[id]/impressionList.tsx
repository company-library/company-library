import EditImpressionButton from '@/app/books/[id]/editImpressionButton'
import UserAvatar from '@/components/userAvatar'
import { DATE_TIME_DISPLAY_FORMAT } from '@/constants'
import { toJstFormat } from '@/libs/luxon/utils'
import prisma from '@/libs/prisma/client'

type Props = {
  bookId: number
  userId: number
}

const ImpressionList = async ({ bookId, userId }: Props) => {
  const recentImpressions = await prisma.impression
    .findMany({
      where: { bookId: bookId },
      include: { user: true },
      orderBy: [{ createdAt: 'desc' }],
    })
    .catch((e) => {
      console.error(e)
      return new Error('Book fetch failed')
    })
  if (recentImpressions instanceof Error) {
    return <p>感想の取得に失敗しました。再読み込みしてみてください。</p>
  }

  if (recentImpressions.length === 0) {
    return <p>現在登録されている感想はありません</p>
  }

  return (
    <table className="table w-full">
      <tbody>
        {recentImpressions.map((impression, index) => {
          return (
            <tr className="hover" key={impression.id}>
              <td className="w-[15rem]" data-testid={`postedDate-${index}`}>
                <p>{toJstFormat(impression.createdAt, DATE_TIME_DISPLAY_FORMAT)}</p>
                {impression.createdAt.getTime() !== impression.updatedAt.getTime() && (
                  <p className="text-xs text-gray-500">
                    {` (更新: ${toJstFormat(impression.updatedAt, DATE_TIME_DISPLAY_FORMAT)})`}
                  </p>
                )}
              </td>
              <td className="w-[5rem]" data-testid={`postedUser-${index}`}>
                <UserAvatar user={impression.user} />
              </td>
              <td className="whitespace-pre-wrap" data-testid={`impression-${index}`}>
                {impression.impression}
              </td>
              <td data-testid={`edit-${index}`}>
                {impression.user.id === userId && <EditImpressionButton impression={impression} />}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default ImpressionList
