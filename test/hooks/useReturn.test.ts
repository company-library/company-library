import { renderHook } from '@testing-library/react'
import { useReturn } from '@/hooks/useReturn'
import { CombinedError } from 'urql'

const expectedReturnHistoryId = 16
const expectedUserId = 5
const expectedBookId = 10

const expectedPostReturnHistoryResult = {
  data: {
    insert_returnHistories_one: {
      lendingHistory: {
        id: expectedReturnHistoryId,
        userId: expectedUserId,
        bookId: expectedBookId,
      },
    },
  },
  error: undefined,
}

const postReturnHistoryMock = jest
  .fn()
  .mockReturnValue(Promise.resolve(expectedPostReturnHistoryResult))

const expectedPostImpressionResult = {
  data: { insert: { id: expectedReturnHistoryId } },
  error: undefined,
}
const postImpressionMock = jest.fn().mockReturnValue(Promise.resolve(expectedPostImpressionResult))

jest.mock('@/generated/graphql.client', () => ({
  __esModule: true,
  usePostReturnHistoryMutation: () => {
    return [undefined, postReturnHistoryMock]
  },
  usePostImpressionMutation: () => {
    return [undefined, postImpressionMock]
  },
}))

describe('useReturn hook', () => {
  const lendingHistoryId = 10
  const impression = '本の感想'
  const emptyImpression = ''

  describe('returnBook function', () => {
    const { result } = renderHook(() => useReturn(lendingHistoryId, impression))
    const returnBook = result.current.returnBook

    it('返却処理と感想登録処理が成功した場合、感想登録処理の戻り値を返す、', async () => {
      const result = await returnBook()

      expect(postReturnHistoryMock).toBeCalledWith({ lendingHistoryId })
      expect(postImpressionMock).toBeCalledWith({
        userId: expectedUserId,
        bookId: expectedBookId,
        impression,
      })
      expect(result).toBe(expectedPostImpressionResult)
    })

    it('感想が入力されなかった場合、感想登録処理は実行されない', async () => {
      const { result } = renderHook(() => useReturn(lendingHistoryId, emptyImpression))
      const returnBookWithEmptyImpression = result.current.returnBook

      const resultWithEmptyImpression = await returnBookWithEmptyImpression()

      expect(postReturnHistoryMock).toBeCalledWith({ lendingHistoryId })
      expect(postImpressionMock).not.toBeCalled()
      expect(resultWithEmptyImpression).toBe(expectedPostReturnHistoryResult)
    })

    it('返却処理の実行結果の戻り値が取得できなかった場合、感想登録処理は実行されない', async () => {
      // dataがundefinedだった場合
      const invalidDataPostReturnHistoryResult = {
        ...expectedPostReturnHistoryResult,
        data: undefined,
      }
      postReturnHistoryMock.mockReturnValueOnce(Promise.resolve(invalidDataPostReturnHistoryResult))

      const invalidDataResult = await returnBook()

      expect(postReturnHistoryMock).lastCalledWith({ lendingHistoryId })
      expect(postImpressionMock).not.toBeCalled()
      expect(invalidDataResult).toBe(invalidDataPostReturnHistoryResult)

      // insertがundefinedだった場合
      const invalidInsertResult = {
        ...expectedPostReturnHistoryResult,
        data: { insert_returnHistories_one: undefined },
      }
      postReturnHistoryMock.mockReturnValueOnce(Promise.resolve(invalidInsertResult))

      const invalidInsertPostReturnHistoryResult = await returnBook()

      expect(postReturnHistoryMock).lastCalledWith({ lendingHistoryId })
      expect(postImpressionMock).not.toBeCalled()
      expect(invalidInsertPostReturnHistoryResult).toBe(invalidInsertResult)
    })

    it('返却処理の実行結果がエラーだった場合、そのエラーをconsole.errorしてから返す', async () => {
      const expectedError = new CombinedError({ graphQLErrors: ['error occurred!'] })
      const expectedErrorResult = { error: expectedError }
      postReturnHistoryMock.mockReturnValueOnce(Promise.resolve(expectedErrorResult))
      console.error = jest.fn()

      const result = await returnBook()

      expect(console.error).toBeCalledWith(expectedErrorResult.error)
      expect(result).toBe(expectedError)
    })

    it('返却処理でエラーが発生した場合、そのエラーをconsole.errorしてからErrorオブジェクトで返す', async () => {
      const expectedError = 'error occurred!'
      postReturnHistoryMock.mockReturnValueOnce(Promise.reject(expectedError))
      console.error = jest.fn()

      const result = await returnBook()

      expect(console.error).toBeCalledWith(expectedError)
      expect(result).toStrictEqual(new Error(expectedError))
    })

    it('感想登録処理の実行結果がエラーだった場合、そのエラーをconsole.errorしてから返す', async () => {
      const expectedError = new CombinedError({ graphQLErrors: ['error occurred!'] })
      const expectedErrorResult = { error: expectedError }
      postImpressionMock.mockReturnValueOnce(Promise.resolve(expectedErrorResult))
      console.error = jest.fn()

      const result = await returnBook()

      expect(console.error).toBeCalledWith(expectedErrorResult.error)
      expect(result).toBe(expectedError)
    })

    it('感想登録処理でエラーが発生した場合、そのエラーをconsole.errorしてからErrorオブジェクトで返す', async () => {
      const expectedError = 'error occurred!'
      postImpressionMock.mockReturnValueOnce(Promise.reject(expectedError))
      console.error = jest.fn()

      const result = await returnBook()

      expect(console.error).toBeCalledWith(expectedError)
      expect(result).toStrictEqual(new Error(expectedError))
    })
  })
})
