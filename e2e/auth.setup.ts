import { expect, test as setup } from '@playwright/test'

/**
 * 認証セットアップ
 *
 * 開発用Mockログイン（CredentialsProvider）で一度サインインし、認証済みセッションを
 * `e2e/.auth/user.json` に保存する。以降の各テストはこの storageState を読み込んで
 * 認証済みの状態から開始する。
 *
 * `NEXT_PUBLIC_DEFAULT_PROVIDER=credentials` のとき、`/auth/signIn` にアクセスすると
 * `dev@example.com` で自動的にサインインが完了し、トップページ（/）へリダイレクトされる
 * （src/app/auth/signIn/page.tsx 参照）。
 *
 * このファイルは playwright.config.ts の `setup` プロジェクトとして、他テストより先に
 * 実行される（dependencies で依存）。setup プロジェクトは webServer 起動後に走るため、
 * サーバーへ確実にアクセスできる。
 */
const authFile = 'e2e/.auth/user.json'

setup('認証', async ({ page }) => {
  // サインインページにアクセスすると credentials プロバイダーで自動ログインされる
  await page.goto('/auth/signIn')

  // ログイン完了後にトップページへリダイレクトされ、書籍一覧が表示される
  await page.waitForURL('/')
  await expect(page.getByRole('link', { name: 'company-library' })).toBeVisible()

  // 認証済みセッション（Cookie等）を保存
  await page.context().storageState({ path: authFile })
})
