import { usePostImpressionMutation, usePostReturnHistoryMutation } from '@/generated/graphql.client'

export const useReturn = (lendingHistoryId: number, impression: string) => {
  const [, postReturnHistory] = usePostReturnHistoryMutation()
  const [, postImpression] = usePostImpressionMutation()

  const returnBook = async () => {
    return await postReturnHistory({
      lendingHistoryId: lendingHistoryId,
    })
      .then(async (lendingHistoryResult) => {
        if (lendingHistoryResult.error) {
          console.error(lendingHistoryResult.error)
          return lendingHistoryResult.error
        }

        const lendingHistory = lendingHistoryResult.data?.insert_returnHistories_one?.lendingHistory
        if (!impression || !lendingHistory) {
          return lendingHistoryResult
        }

        const { userId, bookId } = lendingHistory
        const impressionResult = await postImpression({ userId, bookId, impression })
        if (impressionResult.error) {
          console.error(impressionResult.error)
          return impressionResult.error
        }

        return lendingHistoryResult
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
