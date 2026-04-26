import path from 'node:path'
import { test as setup } from '@playwright/test'

export const AUTH_FILE = path.join(import.meta.dirname, '.auth/user.json')

setup('認証セットアップ', async ({ page }) => {
  // NEXT_PUBLIC_DEFAULT_PROVIDER=credentials のとき、サインインページが
  // 自動的に signIn('credentials', { email: 'dev@example.com', ... }) を呼び出し
  // / へリダイレクトする
  await page.goto('/auth/signIn')
  await page.waitForURL('/', { timeout: 30_000 })
  await page.context().storageState({ path: AUTH_FILE })
})
