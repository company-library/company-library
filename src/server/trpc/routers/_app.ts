import { createCallerFactory, router } from '@/server/trpc/init'
import { bookRouter } from '@/server/trpc/routers/book'
import { locationRouter } from '@/server/trpc/routers/location'

export const appRouter = router({
  book: bookRouter,
  location: locationRouter,
})

export type AppRouter = typeof appRouter

/** サーバーサイドやテストからprocedureを直接呼び出すためのcaller */
export const createCaller = createCallerFactory(appRouter)
