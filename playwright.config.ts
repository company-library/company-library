import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2Eテスト設定
 *
 * 閲覧系ユーザーフロー（ログイン→書籍一覧→検索→詳細→マイページ→利用者一覧）を
 * 実ブラウザで検証する。
 *
 * 前提:
 * - PostgreSQLが起動し、`yarn db:push` / `yarn db:seed` 済みであること
 * - `NEXT_PUBLIC_DEFAULT_PROVIDER=credentials` で開発用Mockログインが有効であること
 */

const baseURL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e',
  // CIでは並列実行を抑えてシードデータへの依存を安定させる
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    // 認証セットアップ（最初に実行してセッションを保存する）
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // setup プロジェクトで保存した認証済みセッションを利用する
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
  // ビルド済みのプロダクションサーバーを起動する（build は実行手順側で行う）
  webServer: {
    command: 'yarn start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
