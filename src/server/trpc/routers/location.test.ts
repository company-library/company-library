import { TRPCError } from '@trpc/server'
import type { Session } from 'next-auth'
import { createCaller } from '@/server/trpc/routers/_app'
import { location1, location2 } from '../../../../test/__utils__/data/location'
import { user1 } from '../../../../test/__utils__/data/user'
import { prismaMock } from '../../../../test/__utils__/libs/prisma/singleton'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))

describe('location router', () => {
  const session = { customUser: user1 } as unknown as Session
  const caller = createCaller({ session })
  const expectedLocations = [location1, location2]

  describe('list', () => {
    it('ロケーション一覧をorder昇順で取得し、それを返す', async () => {
      prismaMock.location.findMany.mockResolvedValueOnce(expectedLocations)

      const result = await caller.location.list()

      expect(result).toEqual(expectedLocations)
      expect(prismaMock.location.findMany).toBeCalledWith({
        orderBy: {
          order: 'asc',
        },
      })
    })

    it('ロケーション一覧の取得に失敗した場合、INTERNAL_SERVER_ERRORを返す', async () => {
      console.error = vi.fn()
      const expectErrorMsg = 'query has errored!'
      prismaMock.location.findMany.mockRejectedValueOnce(expectErrorMsg)

      await expect(caller.location.list()).rejects.toThrow(
        new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Location fetch failed' }),
      )
      expect(console.error).toBeCalledWith(expectErrorMsg)
    })

    it('未ログインの場合、UNAUTHORIZEDを返す', async () => {
      const unauthorizedCaller = createCaller({ session: null })

      await expect(unauthorizedCaller.location.list()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      })
      expect(prismaMock.location.findMany).not.toBeCalled()
    })
  })
})
