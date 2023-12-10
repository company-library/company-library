import { Provider } from 'next-auth/providers'
import { prismaMock } from '../../../../__utils__/libs/prisma/singleton'
import { user1, user2 } from '../../../../__utils__/data/user'

describe('authOptions', () => {
  beforeEach(() => {
    // テストごとに環境変数を書き換えられるように、各テスト実行前に設定する
    process.env.AZURE_AD_B2C_TENANT_NAME = 'tenantName'
    process.env.AZURE_AD_B2C_CLIENT_ID = 'clientId'
    process.env.AZURE_AD_B2C_CLIENT_SECRET = 'clientSecret'
    process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW = 'primaryUserFlow'
  })

  describe('AAD B2Cで認証するために必要な環境変数が未設定の場合、processを終了する', () => {
    const mockConsoleError = jest.spyOn(console, 'error')
    const mockExit = jest.spyOn(process, 'exit')

    beforeAll(() => {
      // 他のテスト実行時にmockされないようにbeforeAllでmock
      mockConsoleError.mockImplementation()
      mockExit.mockImplementation()
    })

    afterAll(() => {
      // 他のテスト実行時にmockされたままにならないようにrestore
      mockConsoleError.mockRestore()
      mockExit.mockRestore()
    })

    it.each([
      { envVarName: 'テナント名', aadEnvs: { AZURE_AD_B2C_TENANT_NAME: undefined } },
      { envVarName: 'クライアントID', aadEnvs: { AZURE_AD_B2C_CLIENT_ID: undefined } },
      {
        envVarName: 'クライアントシークレット',
        aadEnvs: { AZURE_AD_B2C_CLIENT_SECRET: undefined },
      },
      { envVarName: 'ユーザーフロー', aadEnvs: { AZURE_AD_B2C_PRIMARY_USER_FLOW: undefined } },
    ])('$envVarName が未設定', ({ aadEnvs }) => {
      process.env = {
        ...process.env,
        ...aadEnvs,
      }

      jest.isolateModules(() => {
        // moduleを読み込むために変数へ格納する
        const _authOptions = require('@/app/api/auth/[...nextauth]/authOptions').authOptions
      })

      expect(mockConsoleError).toHaveBeenCalledTimes(1)
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Azure AD B2Cに関する、環境変数設定に漏れがあります',
      )
      expect(mockExit).toHaveBeenCalledTimes(1)
      expect(mockExit).toHaveBeenCalledWith()
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

      expect(providerAadB2c.options['tenantId']).toBe('tenantName')
      expect(providerAadB2c.options['clientId']).toBe('clientId')
      expect(providerAadB2c.options['clientSecret']).toBe('clientSecret')
      expect(providerAadB2c.options['primaryUserFlow']).toBe('primaryUserFlow')
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
