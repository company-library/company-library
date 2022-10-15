import { usePostReturnHistoryMutation } from '@/generated/graphql.client'

export const useReturn = (lendingHistoryId: number) => {
  const [postReturnHistoryResult, postReturnHistory] = usePostReturnHistoryMutation()

  const returnBook = async () => {
    return await postReturnHistory({
      lendingHistoryId: lendingHistoryId,
    })
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
    postReturnHistoryResult,
  }
}
