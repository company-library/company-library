import { FC } from 'react'
import { DateTime } from 'luxon'
import { useGetImpressionsQuery } from '@/generated/graphql.client'
import { DATE_FORMAT } from '@/constants'
import UserAvatar from '@/components/userAvatar'

type ImpressionListProps = {
  bookId: number
}

const ImpressionList: FC<ImpressionListProps> = ({ bookId }) => {
  const [result] = useGetImpressionsQuery({ variables: { bookId } })

  if (result.fetching) {
    return <div>Loading...</div>
  }

  if (result.error || !result.data) {
    console.error(result.error)
    return <div>Error!</div>
  }

  if (result.data.impressions.length === 0) {
    return <div>まだ感想が書かれていません😢</div>
  }

  const recentImpressions = result.data.impressions.sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1,
  )

  return (
    <table className="table w-full">
      <tbody>
        {recentImpressions.map((impression, index) => {
          return (
            <tr className="hover:hover" key={impression.id}>
              <td className="w-[15rem]" data-testid={`postedDate-${index}`}>
                {DateTime.fromISO(impression.updatedAt).setZone('Asia/Tokyo').toFormat(DATE_FORMAT)}
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
