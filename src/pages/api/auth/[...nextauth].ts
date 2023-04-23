import NextAuth from 'next-auth'
import AzureADB2CProvider from 'next-auth/providers/azure-ad-b2c'
import { sdk } from '@/libs/graphql-codegen/sdk'
import { User } from '@/models/user'

if (
  !process.env.AZURE_AD_B2C_TENANT_NAME ||
  !process.env.AZURE_AD_B2C_CLIENT_ID ||
  !process.env.AZURE_AD_B2C_CLIENT_SECRET ||
  !process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW
) {
  console.error('Azure AD B2Cに関する、環境変数設定に漏れがあります')
  process.exit()
}

export default NextAuth({
  providers: [
    AzureADB2CProvider({
      tenantId: process.env.AZURE_AD_B2C_TENANT_NAME,
      clientId: process.env.AZURE_AD_B2C_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET,
      primaryUserFlow: process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW,
      authorization: { params: { scope: 'offline_access openid' } },
    }),
  ],
  pages: {
    signIn: '/auth/signIn',
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token
      }

      return token
    },
    async session({ session, token }) {
      if (token.name == null || token.email == null || token.sub == null || token.idToken === undefined) {
        return session
      }

      const getUser = async (sub: string, name: string, email: string, imageUrl: string | undefined | null): Promise<User | undefined> => {
        const maybeUser = await sdk().getUserQuery({ sub })
        if(maybeUser.users.length > 0) {
          return maybeUser.users[0]
        }

        const newUser = await sdk().insertUserQuery({
          name: name,
          email: email,
          sub: sub,
          imageUrl: imageUrl,
        })
        if (newUser.insert_users?.returning?.length ?? 0  === 0) {
          return undefined
        }

        return newUser.insert_users?.returning[0]
      }

      const maybeUser = await getUser(token.sub, token.name, token.email, token.picture)
      if (!maybeUser) {
        return session
      }

      session.customUser = maybeUser

      session.idToken = token.idToken

      return session
    },
  },
})
