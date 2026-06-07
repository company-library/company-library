import { expect, test } from '@playwright/test'

/**
 * ナビゲーションバーの遷移テスト
 *
 * src/app/navigationBar.tsx のリンク（書籍一覧 / 登録 / マイページ / 利用者一覧）が
 * 正しいURLへ遷移することを確認する。
 */
test.describe('ナビゲーションバー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('サイトタイトルが表示される', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'company-library' })).toBeVisible()
  })

  test('「登録」リンクから書籍登録ページへ遷移する', async ({ page }) => {
    await page.getByRole('link', { name: '登録', exact: true }).click()
    await expect(page).toHaveURL('/books/register')
  })

  test('「利用者一覧」リンクから利用者一覧ページへ遷移する', async ({ page }) => {
    await page.getByRole('link', { name: '利用者一覧' }).click()
    await expect(page).toHaveURL('/users')
  })

  test('「マイページ」リンクからユーザー詳細ページへ遷移する', async ({ page }) => {
    await page.getByRole('link', { name: 'マイページ' }).click()
    await expect(page).toHaveURL(/\/users\/\d+/)
  })

  test('「書籍一覧」リンクからトップページへ戻る', async ({ page }) => {
    await page.goto('/users')
    await page.getByRole('link', { name: '書籍一覧' }).click()
    await expect(page).toHaveURL('/')
  })
})
