import { renderHook } from '@testing-library/react'
import { useReturn } from '@/hooks/useReturn'
import { CombinedError } from 'urql'

describe('useReturn hook', () => {
  const lendingHistoryId = 10

  const expectedMutationResult = {
    data: undefined,
    error: undefined,
    extensions: undefined,
    fetching: false,
    operation: undefined,
    stale: false,
  }
  const expectedReturnHistoryId = 16
  const expectedResult = {
    data: { insert: { id: expectedReturnHistoryId } },
    error: undefined,
    extensions: undefined,
    hasNext: false,
    operation: {
      variables: { lendingHistoryId: lendingHistoryId },
    },
  }
  const mutationMock = jest.fn().mockReturnValue(Promise.resolve(expectedResult))
  jest
    .spyOn(require('@/generated/graphql.client'), 'usePostReturnHistoryMutation')
    .mockReturnValue([expectedMutationResult, mutationMock])

  describe('returnBook function', () => {
    const { result } = renderHook(() => useReturn(lendingHistoryId))
    const returnBook = result.current.returnBook

    it('返却処理が成功した場合、その戻り値を返す、', async () => {
      const result = await returnBook()

      expect(mutationMock).toBeCalledWith({ lendingHistoryId: lendingHistoryId })
      expect(result).toBe(expectedResult)
    })

    it('返却処理の実行結果がエラーだった場合、そのエラーをconsole.errorしてから返す', async () => {
      const expectedError = new CombinedError({ graphQLErrors: ['error occurred!'] })
      const expectedErrorResult = { error: expectedError }
      mutationMock.mockReturnValueOnce(Promise.resolve(expectedErrorResult))
      console.error = jest.fn()

      const result = await returnBook()

      expect(console.error).toBeCalledWith(expectedErrorResult.error)
      expect(result).toBe(expectedError)
    })

    it('返却処理でエラーが発生した場合、そのエラーをconsole.errorしてからErrorオブジェクトで返す', async () => {
      const expectedError = 'error occurred!'
      mutationMock.mockReturnValueOnce(Promise.reject(expectedError))
      console.error = jest.fn()

      const result = await returnBook()

      expect(console.error).toBeCalledWith(expectedError)
      expect(result).toStrictEqual(new Error(expectedError))
    })
  })
})
