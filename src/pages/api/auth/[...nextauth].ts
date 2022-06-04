import NextAuth from 'next-auth'
import AzureADB2CProvider from 'next-auth/providers/azure-ad-b2c'

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
  callbacks: {
    session({ session, token, user }) {
      return session
    },
  },
})
