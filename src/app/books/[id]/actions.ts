'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import * as z from 'zod/v4'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/libs/prisma/client'

/**
 * 書籍を貸し出すServer Action
 * @param {number} bookId
 * @param {number} userId
 * @param {Date} dueDate
 * @param {number} locationId
 * @returns {Promise<Error>}
 */
export const lendBook = async (
  bookId: number,
  userId: number,
  dueDate: Date,
  locationId: number,
): Promise<undefined | Error> => {
  const history = await prisma.lendingHistory
    .create({ data: { bookId, userId, dueDate, locationId } })
    .catch((e) => {
      console.error(e)
      return new Error('貸し出しに失敗しました。もう一度試して見てください。')
    })
  if (history instanceof Error) {
    return history
  }

  return undefined
}

type LendBookState = {
  success: boolean
  error: string | null
}

/**
 * useActionState用の書籍貸出アクション
 */
export const lendBookAction = async (
  _prevState: LendBookState,
  formData: FormData,
): Promise<LendBookState> => {
  const bookId = Number(formData.get('bookId'))
  const userId = Number(formData.get('userId'))
  const dueDate = new Date(formData.get('dueDate') as string)
  const locationId = Number(formData.get('locationId'))

  const result = await lendBook(bookId, userId, dueDate, locationId)

  if (result instanceof Error) {
    return {
      success: false,
      error: result.message,
    }
  }

  return {
    success: true,
    error: null,
  }
}

type ReturnBookState = {
  success: boolean
  error: string | null
  value: ReturnBook
  errors?: Partial<Record<keyof ReturnBook, string[]>>
}

/**
 * useActionState用の書籍返却アクション
 */
export const returnBookAction = async (
  _prevState: ReturnBookState,
  formData: FormData,
): Promise<ReturnBookState> => {
  const rawValues = {
    bookId: formData.get('bookId'),
    userId: formData.get('userId'),
    lendingHistoryId: formData.get('lendingHistoryId'),
    impression: formData.get('impression') || '',
  } as unknown as ReturnBook

  const validationResult = ReturnBookSchema.safeParse(rawValues)
  if (!validationResult.success) {
    const errors = z.flattenError(validationResult.error).fieldErrors

    return {
      success: false,
      error: null,
      value: rawValues,
      errors,
    }
  }

  const result = await returnBook({
    bookId: validationResult.data.bookId,
    userId: validationResult.data.userId,
    lendingHistoryId: validationResult.data.lendingHistoryId,
    impression: validationResult.data.impression || '',
  })

  if (result instanceof Error) {
    return {
      success: false,
      error: result.message,
      value: validationResult.data,
    }
  }

  return {
    success: true,
    error: null,
    value: validationResult.data,
  }
}

/**
 * 書籍を返却するServer Action
 * @param {number} bookId 返却対象の書籍ID
 * @param {number} userId 返却を行うユーザーID
 * @param {number} lendingHistoryId 貸し出し履歴ID
 * @param {string} impression 感想の本文
 * @returns {Promise<void | Error>} 処理でエラーがあった場合はErrorオブジェクトを返す
 */
export const returnBook = async ({
  bookId,
  userId,
  lendingHistoryId,
  impression,
}: ReturnBookWithImpressionProps): Promise<undefined | Error> => {
  const result = await prisma
    .$transaction(async (prisma) => {
      await prisma.returnHistory.create({
        data: {
          lendingHistoryId,
        },
      })

      if (impression) {
        await prisma.impression.create({
          data: {
            bookId,
            userId,
            impression,
          },
        })
      }
    })
    .catch((e) => {
      console.error(e)
      return new Error('返却に失敗しました。もう一度試して見てください。')
    })
  if (result instanceof Error) {
    return result
  }

  return undefined
}
type ReturnBookWithImpressionProps = {
  bookId: number
  userId: number
  lendingHistoryId: number
  impression: string
}

/**
 * 感想を編集するServer Action
 * @param impressionId 感想ID
 * @param editedImpression 編集した感想
 * @returns 処理でエラーがあった場合はErrorオブジェクトを返す
 */
export const editImpression = async ({
  impressionId,
  editedImpression,
}: {
  impressionId: number
  editedImpression: string
}) => {
  const session = await getServerSession(authOptions)
  if (!session) {
    console.error('セッションが取得できませんでした')
    return new Error('感想の編集に失敗しました。もう一度試して見てください。')
  }
  const userId = session.customUser.id

  const result = await prisma
    .$transaction(async (tx) => {
      const updateResult = await tx.impression.updateMany({
        where: {
          id: impressionId,
          userId: userId,
        },
        data: {
          impression: editedImpression,
        },
      })

      if (updateResult.count !== 1) {
        throw new Error('自分の感想以外を編集しようとしています', { cause: updateResult })
      }
    })
    .catch((e) => {
      console.error(e)
      return new Error('感想の編集に失敗しました。もう一度試して見てください。')
    })
  if (result instanceof Error) {
    return result
  }

  return undefined
}

const ReturnBookSchema = z.object({
  bookId: z.coerce.number().positive({ message: '有効な書籍IDを入力してください' }),
  userId: z.coerce.number().positive({ message: '有効なユーザーIDを入力してください' }),
  lendingHistoryId: z.coerce.number().positive({ message: '有効な貸出履歴IDを入力してください' }),
  impression: z.string().optional(),
})
type ReturnBook = z.infer<typeof ReturnBookSchema>

const AddImpressionSchema = z.object({
  impression: z.string().min(1, {
    message: '1文字以上入力してください',
  }),
})
type AddImpression = z.infer<typeof AddImpressionSchema>

export type AddImpressionResult = {
  success: boolean
  value: AddImpression
  errors?: Partial<Record<keyof AddImpression, string[]>>
  apiError: Error | null
}

/**
 * 感想を追加するServer Actions
 * @param {AddImpressionResult} _
 * @param {FormData} formData 追加する感想のデータ
 * @param {number} bookId 対象書籍ID
 * @returns {Promise<AddImpressionResult>} 感想の追加結果
 */
export const addImpression = async (
  _: AddImpressionResult,
  formData: FormData,
  bookId: number,
): Promise<AddImpressionResult> => {
  const rawValues = {
    impression: formData.get('impression') ?? '',
  } as unknown as AddImpression

  const session = await getServerSession(authOptions)
  if (!session) {
    console.error('セッションが取得できませんでした')
    return {
      success: false,
      value: rawValues,
      apiError: new Error('感想の追加に失敗しました。もう一度試して見てください。'),
    }
  }
  const userId = session.customUser.id

  const validationResult = AddImpressionSchema.safeParse(rawValues)
  if (!validationResult.success) {
    const errors = z.flattenError(validationResult.error).fieldErrors

    return {
      success: false,
      value: rawValues as unknown as AddImpression,
      errors,
      apiError: null,
    }
  }

  const result = await prisma
    .$transaction(async (tx) => {
      await tx.impression.create({
        data: {
          bookId,
          userId,
          ...validationResult.data,
        },
      })
    })
    .catch((e) => {
      console.error(e)
      return new Error('感想の追加に失敗しました。もう一度試して見てください。')
    })
  if (result instanceof Error) {
    return {
      success: false,
      value: validationResult.data,
      apiError: result,
    }
  }

  revalidatePath(`/books/${bookId}`)

  return {
    success: true,
    value: { impression: '' },
    apiError: null,
  }
}
