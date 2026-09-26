import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { createContext } from '@/server/trpc/init'
import { appRouter } from '@/server/trpc/routers/_app'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
    onError: ({ path, error }) => {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        console.error(`tRPC failed on ${path ?? '<no-path>'}: ${error.message}`)
      }
    },
  })

export { handler as GET, handler as POST }
