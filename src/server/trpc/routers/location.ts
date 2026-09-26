import { TRPCError } from '@trpc/server'
import prisma from '@/libs/prisma/client'
import { protectedProcedure, router } from '@/server/trpc/init'

export const locationRouter = router({
  /** 保管場所の一覧をorder昇順で取得する */
  list: protectedProcedure.query(async () => {
    const locations = await prisma.location
      .findMany({
        orderBy: {
          order: 'asc',
        },
      })
      .catch((e) => {
        console.error(e)
        return new Error('Location fetch failed')
      })

    if (locations instanceof Error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: locations.message })
    }

    return locations
  }),
})
