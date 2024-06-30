import type { User } from '@/models/user'

declare module 'next-auth' {
  interface Session {
    customUser: User
    idToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    idToken: string | undefined
  }
}
