import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  // 1テストあたりの上限（個別アクションのハング防止の最終防衛線）
  timeout: 90 * 1000,
  // 全テストの合計上限。万一ハングしてもジョブが無限に待ち続けないようにする
  globalTimeout: 10 * 60 * 1000,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ...(process.env.CI ? ([['github']] as const) : []),
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    video: 'on',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    // CIでは本番ビルド済みサーバー（yarn start）を使う。
    // dev サーバー（yarn dev）はルート初回アクセス時にオンデマンドコンパイルが
    // 走り、CI環境では各ルートのコンパイルに数十秒〜かかってテストがタイムアウト・
    // ハングする原因になっていた。本番ビルドは事前コンパイル済みで高速かつ決定的。
    // ローカルでは利便性のため yarn dev を使う。
    command: process.env.CI ? 'yarn start' : 'yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NEXT_PUBLIC_DEFAULT_PROVIDER: 'credentials',
    },
  },
})
