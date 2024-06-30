import type { Provider } from 'next-auth/providers'
import { user1, user2 } from '../../../../__utils__/data/user'
import { prismaMock } from '../../../../__utils__/libs/prisma/singleton'

describe('authOptions', () => {
  beforeEach(() => {
    // テストごとに環境変数を書き換えられるように、各テスト実行前に設定する
    process.env.AZURE_AD_TENANT_ID = 'tenantIdAAD'
    process.env.AZURE_AD_CLIENT_ID = 'clientIdAAD'
    process.env.AZURE_AD_CLIENT_SECRET = 'clientSecretAAD'

    process.env.AZURE_AD_B2C_TENANT_NAME = 'tenantNameAADB2C'
    process.env.AZURE_AD_B2C_CLIENT_ID = 'clientIdAADB2C'
    process.env.AZURE_AD_B2C_CLIENT_SECRET = 'clientSecretAADB2C'
    process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW = 'primaryUserFlowAADB2C'
  })

  describe('AAD provider の確認', () => {
    it('Providerが作成されている', () => {
      const providerAAD =
        require('@/app/api/auth/[...nextauth]/authOptions').authOptions.providers.find(
          (provider: Provider) => provider.id === 'azure-ad',
        )

      expect(providerAAD).not.toBeUndefined()
    })

    it('Providerに、認証に必要な環境変数の値が設定されている', () => {
      const providerAAD =
        require('@/app/api/auth/[...nextauth]/authOptions').authOptions.providers.find(
          (provider: Provider) => provider.id === 'azure-ad',
        )

      expect(providerAAD.options['tenantId']).toBe('tenantIdAAD')
      expect(providerAAD.options['clientId']).toBe('clientIdAAD')
      expect(providerAAD.options['clientSecret']).toBe('clientSecretAAD')
    })
  })

  describe('AAD B2C provider の確認', () => {
    it('AAD B2C のProviderが作成されている', () => {
      const providerAadB2c =
        require('@/app/api/auth/[...nextauth]/authOptions').authOptions.providers.find(
          (provider: Provider) => provider.id === 'azure-ad-b2c',
        )

      expect(providerAadB2c).not.toBeUndefined()
    })

    it('AAD B2C のProviderに、認証に必要な環境変数の値が設定されている', () => {
      const providerAadB2c =
        require('@/app/api/auth/[...nextauth]/authOptions').authOptions.providers.find(
          (provider: Provider) => provider.id === 'azure-ad-b2c',
        )

      expect(providerAadB2c.options['tenantId']).toBe('tenantNameAADB2C')
      expect(providerAadB2c.options['clientId']).toBe('clientIdAADB2C')
      expect(providerAadB2c.options['clientSecret']).toBe('clientSecretAADB2C')
      expect(providerAadB2c.options['primaryUserFlow']).toBe('primaryUserFlowAADB2C')
      expect(providerAadB2c.options['authorization']).toStrictEqual({
        params: { scope: 'offline_access openid' },
      })
    })

    it('AAD B2C のProviderのscopeに、リフレッシュトークンとIDトークンを要求する', () => {
      const providerAadB2c =
        require('@/app/api/auth/[...nextauth]/authOptions').authOptions.providers.find(
          (provider: Provider) => provider.id === 'azure-ad-b2c',
        )

      expect(providerAadB2c.options['authorization']).toStrictEqual({
        params: { scope: 'offline_access openid' },
      })
    })
  })

  describe('callbacks の確認', () => {
    describe('jwt', () => {
      it('accountが渡された場合、IDトークンをtokenにセットする', async () => {
        const token = {}
        const account = { id_token: 'accountIdToken' }

        const jwt = require('@/app/api/auth/[...nextauth]/authOptions').authOptions.callbacks.jwt
        const result = await jwt({ token, account })

        expect(result.idToken).toBe(account.id_token)
      })

      it('accountが渡されなかった場合、何もしない', async () => {
        const token = {}
        const account = null

        const jwt = require('@/app/api/auth/[...nextauth]/authOptions').authOptions.callbacks.jwt
        const result = await jwt({ token, account })

        expect(result.idToken).toBeUndefined()
      })
    })

    describe('session', () => {
      const defaultSession = { expires: '2018-10-26T19:32:52+09:00' }
      const defaultToken = {
        name: 'user name',
        email: 'user@example.com',
        picture: 'pictureUri',
        idToken: 'tokenIdToken',
      }

      it.each([
        { inValidProperty: 'name', inValidToken: { name: undefined } },
        { inValidProperty: 'email', inValidToken: { email: undefined } },
        { inValidProperty: 'idToken', inValidToken: { idToken: undefined } },
      ])(
        'tokenに必要な値($inValidProperty)が設定されていなかった場合は、引数で渡されたsessionをそのまま返す',
        async ({ inValidToken }) => {
          const argSession = { ...defaultSession }
          const argToken = {
            ...defaultToken,
            ...inValidToken,
          }

          const session = require('@/app/api/auth/[...nextauth]/authOptions').authOptions.callbacks
            .session
          const result = await session({ session: argSession, token: argToken })

          expect(result).toStrictEqual(defaultSession)
        },
      )

      it('ユーザー情報が存在する場合は、引数で渡されたsessionに、ユーザー情報とtokenのIDトークンをセットして返す', async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(user1)
        const argSession = { ...defaultSession }
        const argToken = { ...defaultToken }

        const session = require('@/app/api/auth/[...nextauth]/authOptions').authOptions.callbacks
          .session
        const result = await session({ session: argSession, token: argToken })

        expect(result).toStrictEqual({
          ...defaultSession,
          customUser: user1,
          idToken: 'tokenIdToken',
        })
      })

      it('ユーザー情報が存在しない場合は、tokenの情報でユーザーを作成し、作成したユーザー情報とtokenのIDトークンをセットして返す', async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(null)
        prismaMock.user.create.mockResolvedValueOnce(user2)
        const argSession = { ...defaultSession }
        const argToken = { ...defaultToken }

        const session = require('@/app/api/auth/[...nextauth]/authOptions').authOptions.callbacks
          .session
        const result = await session({ session: argSession, token: argToken })

        expect(result).toStrictEqual({
          ...defaultSession,
          customUser: user2,
          idToken: 'tokenIdToken',
        })
        expect(prismaMock.user.create).toHaveBeenCalledWith({
          data: {
            name: argToken.name,
            email: argToken.email,
            imageUrl: argToken.picture,
          },
        })
      })

      it('ユーザーの作成に失敗した場合は、引数で渡されたsessionをそのまま返す', async () => {
        const mockConsoleError = jest.spyOn(console, 'error').mockImplementationOnce(() => {})
        prismaMock.user.findUnique.mockResolvedValueOnce(null)
        prismaMock.user.create.mockRejectedValueOnce('prisma error')
        const argSession = { ...defaultSession }
        const argToken = { ...defaultToken }

        const session = require('@/app/api/auth/[...nextauth]/authOptions').authOptions.callbacks
          .session
        const result = await session({ session: argSession, token: argToken })

        expect(result).toStrictEqual(defaultSession)
        expect(mockConsoleError).toHaveBeenCalledTimes(1)
        expect(mockConsoleError).toHaveBeenCalledWith('prisma error')
      })
    })
  })
})
