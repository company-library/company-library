import { NextAuthOptions } from 'next-auth'
import AzureADB2CProvider from 'next-auth/providers/azure-ad-b2c'
import prisma from '@/libs/prisma/client'

if (
  !process.env.AZURE_AD_B2C_TENANT_NAME ||
  !process.env.AZURE_AD_B2C_CLIENT_ID ||
  !process.env.AZURE_AD_B2C_CLIENT_SECRET ||
  !process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW
) {
  console.error('Azure AD B2Cに関する、環境変数設定に漏れがあります')
  process.exit()
}

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADB2CProvider({
      tenantId: process.env.AZURE_AD_B2C_TENANT_NAME,
      clientId: process.env.AZURE_AD_B2C_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET,
      primaryUserFlow: process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW,
      authorization: { params: { scope: 'offline_access openid' } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token
      }

      return token
    },
    async session({ session, token }) {
      if (token.name == null || token.email == null || token.idToken === undefined) {
        return session
      }

      const getUser = async (name: string, email: string, imageUrl: string | undefined | null) => {
        const maybeUser = await prisma.user.findUnique({ where: { email } })
        if (maybeUser != null) {
          return maybeUser
        }

        const newUser = await prisma.user
          .create({
            data: {
              name: name,
              email: email,
              imageUrl: imageUrl,
            },
          })
          .catch((e) => {
            console.error(e)
            return new Error('User create failed')
          })
        if (newUser instanceof Error) {
          return undefined
        }

        return newUser
      }

      const maybeUser = await getUser(token.name, token.email, token.picture)
      if (!maybeUser) {
        return session
      }

      session.customUser = maybeUser

      session.idToken = token.idToken

      return session
    },
  },
}
