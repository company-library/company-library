import { getAvatarUrl } from '@/libs/gravatar/getAvatarUrl'

describe('getAvatarUrl', () => {
  const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 })
  global.fetch = fetchMock

  it('Gravatar画像存在チェックのリクエストが成功して画像がある場合、Gravatar画像取得用のURLを返す', async () => {
    const result = await getAvatarUrl('MyEmailAddress@example.com ')

    expect(result).toBe(
      'https://gravatar.com/avatar/84059b07d4be67b806386c0aad8070a23f18836bbaae342275dc0a83414c32ee.jpg?d=mp',
    )
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://gravatar.com/avatar/84059b07d4be67b806386c0aad8070a23f18836bbaae342275dc0a83414c32ee.jpg?d=404',
    )
  })

  it('Gravatar画像存在チェックのリクエストが成功して画像が無い場合、undefinedを返す', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404 })

    const result = await getAvatarUrl('MyEmailAddress@example.com ')

    expect(result).toBeUndefined()
  })

  it('Gravatar画像存在チェックのリクエストが失敗した場合、undefinedを返す', async () => {
    const expectedError = new Error('network error')
    fetchMock.mockRejectedValueOnce(expectedError)
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementationOnce(() => {})

    const result = await getAvatarUrl('MyEmailAddress@example.com ')

    expect(result).toBeUndefined()
    expect(consoleErrorMock).toHaveBeenLastCalledWith('gravatar fetch failed', expectedError)
  })
})
