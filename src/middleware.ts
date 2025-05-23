import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/api/cron']

export default withAuth(
  function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    pages: {
      signIn: '/auth/signIn',
    },
  },
)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}
