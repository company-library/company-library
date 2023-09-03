import { OldUser } from '@/models/user'

declare module 'next-auth' {
  interface Session {
    customUser: OldUser
    idToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    idToken: string | undefined
  }
}
