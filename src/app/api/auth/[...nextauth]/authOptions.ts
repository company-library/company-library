import type { NextAuthOptions } from 'next-auth'
import AzureAD from 'next-auth/providers/azure-ad'
import AzureADB2CProvider from 'next-auth/providers/azure-ad-b2c'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/libs/prisma/client'

const providers: NextAuthOptions['providers'] = [
  AzureAD({
    tenantId: process.env.AZURE_AD_TENANT_ID ?? '',
    clientId: process.env.AZURE_AD_CLIENT_ID ?? '',
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? '',
  }),
  AzureADB2CProvider({
    tenantId: process.env.AZURE_AD_B2C_TENANT_NAME ?? '',
    clientId: process.env.AZURE_AD_B2C_CLIENT_ID ?? '',
    clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET ?? '',
    primaryUserFlow: process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW ?? '',
    authorization: { params: { scope: 'offline_access openid' } },
  }),
]

if (
  process.env.NODE_ENV !== 'production' ||
  process.env.NEXT_PUBLIC_DEFAULT_PROVIDER === 'credentials'
) {
  providers.push(
    CredentialsProvider({
      name: 'Mock Login',
      credentials: {
        email: { label: 'メールアドレス', type: 'email', value: 'dev@example.com' },
        password: { label: 'パスワード', type: 'password', value: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        return {
          id: credentials.email,
          name: credentials.email.split('@')[0],
          email: credentials.email,
        }
      },
    }),
  )
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token ?? 'mock-token'
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
