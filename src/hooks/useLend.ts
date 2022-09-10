import React, { useState } from 'react'
import { usePostLendingHistoryMutation } from '@/generated/graphql.client'
import { useCustomUser } from '@/hooks/useCustomUser'

export const useLend = (bookId: number, initialDueDate: string) => {
  const { user } = useCustomUser()

  const [dueDate, setDueDate] = useState(initialDueDate)
  const handleDueDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDueDate(e.currentTarget.value)
  }

  const [postLendingHistoryResult, postLendingHistory] = usePostLendingHistoryMutation()
  const lend = async () => {
    const result = await postLendingHistory({
      userId: user ? user.id : 0,
      bookId: bookId,
      dueDate: dueDate,
    })
      .then((result) => {
        if (result.error) {
          console.error(result.error)
          return new Error('貸し出しに失敗しました。もう一度試して見てください。')
        }

        return result
      })
      .catch((err) => {
        console.error(err)
        return new Error('貸し出しに失敗しました。もう一度試して見てください。')
      })

    if (result instanceof Error) {
      window.alert(result.message)
    }
  }

  return {
    lend,
    dueDate,
    handleDueDate,
    postLendingHistoryResult,
  }
}
