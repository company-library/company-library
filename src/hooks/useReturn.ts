import { usePostImpressionMutation, usePostReturnHistoryMutation } from '@/generated/graphql.client'

export const useReturn = (lendingHistoryId: number, impression: string) => {
  const [, postReturnHistory] = usePostReturnHistoryMutation()
  const [, postImpression] = usePostImpressionMutation()

  const returnBook = async () => {
    const postReturnHistoryResult = await postReturnHistory({
      lendingHistoryId: lendingHistoryId,
    })
      .then(async (result) => {
        if (result.error) {
          console.error(result.error)
          return result.error
        }

        return result
      })
      .catch((err) => {
        console.error(err)
        return new Error(err)
      })
    if (postReturnHistoryResult instanceof Error) {
      return postReturnHistoryResult
    }

    const lendingHistory = postReturnHistoryResult.data?.insert_returnHistories_one?.lendingHistory
    if (!impression || !lendingHistory) {
      return postReturnHistoryResult
    }

    const { userId, bookId } = lendingHistory

    return await postImpression({ userId, bookId, impression })
      .then((result) => {
        if (result.error) {
          console.error(result.error)
          return result.error
        }

        return result
      })
      .catch((err) => {
        console.error(err)
        return new Error(err)
      })
  }

  return {
    returnBook,
  }
}
