import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import type { AppRouter } from '@/server/trpc/routers/_app'

/**
 * クライアントコンポーネントからBFF（tRPC）を呼び出すためのクライアント
 * SWRのfetcherとして使用する
 */
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      transformer: superjson,
    }),
  ],
})
