import { FC } from 'react'
import { DateTime } from 'luxon'
import { useGetImpressionsQuery } from '@/generated/graphql.client'
import { DATE_FORMAT } from '@/constants'

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
    <table>
      <thead>
        <tr>
          <th>投稿日</th>
          <th>人</th>
          <th>感想</th>
        </tr>
      </thead>
      <tbody>
        {recentImpressions.map((impression, index) => {
          return (
            <tr key={impression.id}>
              <td data-testid={`postedDate-${index}`}>
                {DateTime.fromISO(impression.updatedAt).setZone('Asia/Tokyo').toFormat(DATE_FORMAT)}
              </td>
              <td data-testid={`postedUser-${index}`}>{impression.user.name}</td>
              <td data-testid={`impression-${index}`}>{impression.impression}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default ImpressionList
