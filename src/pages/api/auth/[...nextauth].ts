import NextAuth from 'next-auth'
import Auth0Provider from 'next-auth/providers/auth0'
import { sdk } from '@/libs/graphql-codegen/sdk'

if (!process.env.AUTH0_CLIENT_ID || !process.env.AUTH0_CLIENT_SECRET || !process.env.AUTH0_ISSUER || !process.env.AUTH0_AUDIENCE) {
  console.error('Auth0に関する、環境変数設定に漏れがあります')
  process.exit()
}

export default NextAuth({
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: process.env.AUTH0_ISSUER,
      token: {
        params: {
          audience: process.env.AUTH0_AUDIENCE
        }
      },
      authorization: {
        params: {
          audience: encodeURI(process.env.AUTH0_AUDIENCE)
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token
        token.accessToken = account.access_token
      }

      return token
    },
    async session({ session, token }) {
      if (token.name == null || token.email == null || token.sub == null) {
        return session
      }

      const maybeUser = await sdk().getUserQuery({ email: token.email })
      session.customUser =
        maybeUser.users.length > 0
          ? maybeUser.users[0]
          : await sdk().insertUserQuery({
              name: token.name,
              email: token.email,
              sub: token.sub,
              imageUrl: token.picture,
            })

      session.idToken = token.idToken
      session.accessToken = token.accessToken

      return session
    },
  },
})
