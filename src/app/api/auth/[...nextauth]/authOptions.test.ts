import type { Provider, ProviderType } from 'next-auth/providers/index'
import { user1, user2 } from '../../../../../test/__utils__/data/user'
import { prismaMock } from '../../../../../test/__utils__/libs/prisma/singleton'

describe('authOptions', async () => {
  vi.stubEnv('AZURE_AD_TENANT_ID', 'tenantIdAAD')
  vi.stubEnv('AZURE_AD_CLIENT_ID', 'clientIdAAD')
  vi.stubEnv('AZURE_AD_CLIENT_SECRET', 'clientSecretAAD')

  vi.stubEnv('AZURE_AD_B2C_TENANT_NAME', 'tenantNameAADB2C')
  vi.stubEnv('AZURE_AD_B2C_CLIENT_ID', 'clientIdAADB2C')
  vi.stubEnv('AZURE_AD_B2C_CLIENT_SECRET', 'clientSecretAADB2C')
  vi.stubEnv('AZURE_AD_B2C_PRIMARY_USER_FLOW', 'primaryUserFlowAADB2C')

  const { authOptions } = await import('@/app/api/auth/[...nextauth]/authOptions')

  describe('AAD provider の確認', () => {
    it('Providerが作成されている', async () => {
      const providerAAD = authOptions.providers.find(
        (provider: Provider) => provider.id === 'azure-ad',
      )

      expect(providerAAD).not.toBeUndefined()
    })

    it('Providerに、認証に必要な環境変数の値が設定されている', async () => {
      const providerAAD = authOptions.providers.find(
        (provider: Provider) => provider.id === 'azure-ad',
      )

      expect(providerAAD?.options.tenantId).toBe('tenantIdAAD')
      expect(providerAAD?.options.clientId).toBe('clientIdAAD')
      expect(providerAAD?.options.clientSecret).toBe('clientSecretAAD')
    })
  })

  describe('AAD B2C provider の確認', () => {
    it('AAD B2C のProviderが作成されている', () => {
      const providerAadB2c = authOptions.providers.find(
        (provider: Provider) => provider.id === 'azure-ad-b2c',
      )

      expect(providerAadB2c).not.toBeUndefined()
    })

    it('AAD B2C のProviderに、認証に必要な環境変数の値が設定されている', () => {
      const providerAadB2c = authOptions.providers.find(
        (provider: Provider) => provider.id === 'azure-ad-b2c',
      )

      expect(providerAadB2c?.options.tenantId).toBe('tenantNameAADB2C')
      expect(providerAadB2c?.options.clientId).toBe('clientIdAADB2C')
      expect(providerAadB2c?.options.clientSecret).toBe('clientSecretAADB2C')
      expect(providerAadB2c?.options.primaryUserFlow).toBe('primaryUserFlowAADB2C')
      expect(providerAadB2c?.options.authorization).toStrictEqual({
        params: { scope: 'offline_access openid' },
      })
    })

    it('AAD B2C のProviderのscopeに、リフレッシュトークンとIDトークンを要求する', () => {
      const providerAadB2c = authOptions.providers.find(
        (provider: Provider) => provider.id === 'azure-ad-b2c',
      )

      expect(providerAadB2c?.options.authorization).toStrictEqual({
        params: { scope: 'offline_access openid' },
      })
    })
  })

  describe('callbacks の確認', () => {
    describe('jwt', () => {
      it('accountが渡された場合、IDトークンをtokenにセットする', async () => {
        const token = { idToken: 'accountIdToken' }
        const account = {
          id_token: 'accountIdToken',
          providerAccountId: 'provider1',
          provider: 'provider1',
          type: 'oauth' as ProviderType,
        }
        const user = { id: '1' }

        const jwt = authOptions.callbacks?.jwt
        assert(!!jwt, 'jwt callback is not defined')

        const result = await jwt({ token, user, account })

        expect(result.idToken).toBe(account.id_token)
      })

      it('accountが渡されなかった場合、何もしない', async () => {
        const token = { idToken: undefined }
        const account = null
        const user = { id: '1' }

        const jwt = authOptions.callbacks?.jwt
        assert(!!jwt, 'jwt callback is not defined')

        const result = await jwt({ token, user, account })

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

          const session = authOptions.callbacks?.session
          assert(!!session, 'session callback is not defined')

          // @ts-ignore
          const result = await session({ session: argSession, token: argToken })

          expect(result).toStrictEqual(defaultSession)
        },
      )

      it('ユーザー情報が存在する場合は、引数で渡されたsessionに、ユーザー情報とtokenのIDトークンをセットして返す', async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(user1)
        const argSession = { ...defaultSession }
        const argToken = { ...defaultToken }

        const session = authOptions.callbacks?.session
        assert(!!session, 'session callback is not defined')

        // @ts-ignore
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

        const session = authOptions.callbacks?.session
        assert(!!session, 'session callback is not defined')

        // @ts-ignore
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
        const mockConsoleError = vi.spyOn(console, 'error').mockImplementationOnce(() => {})
        prismaMock.user.findUnique.mockResolvedValueOnce(null)
        prismaMock.user.create.mockRejectedValueOnce('prisma error')
        const argSession = { ...defaultSession }
        const argToken = { ...defaultToken }

        const session = authOptions.callbacks?.session
        assert(!!session, 'session callback is not defined')

        // @ts-ignore
        const result = await session({ session: argSession, token: argToken })

        expect(result).toStrictEqual(defaultSession)
        expect(mockConsoleError).toHaveBeenCalledTimes(1)
        expect(mockConsoleError).toHaveBeenCalledWith('prisma error')
      })
    })
  })
})
