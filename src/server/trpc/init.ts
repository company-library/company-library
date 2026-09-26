import { initTRPC, TRPCError } from '@trpc/server'
import type { Session } from 'next-auth'
import { getServerSession } from 'next-auth'
import superjson from 'superjson'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export type Context = {
  session: Session | null
}

/**
 * tRPCのリクエストごとのコンテキストを生成する
 * @returns {Promise<Context>}
 */
export const createContext = async (): Promise<Context> => {
  const session = await getServerSession(authOptions)
  return { session }
}

const t = initTRPC.context<Context>().create({
  // Date型などをJSONで正しく受け渡すためにsuperjsonを使用する
  transformer: superjson,
})

export const router = t.router
export const createCallerFactory = t.createCallerFactory

/** 認証不要のprocedure */
export const publicProcedure = t.procedure

/** 認証済みユーザーのみ実行可能なprocedure */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.customUser) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' })
  }
  return next({ ctx: { session: ctx.session } })
})
