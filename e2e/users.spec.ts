import { expect, test } from '@playwright/test'

/**
 * 利用者一覧・ユーザー詳細ページのテスト
 *
 * src/app/users/page.tsx（利用者一覧）と src/app/users/[id]/page.tsx（ユーザー詳細）の
 * 表示を確認する。アサーションは prisma/seed.ts のシードデータ（アリス / ボブ）に依存する。
 */
test.describe('利用者一覧・詳細', () => {
  test('利用者一覧にシードのユーザーが表示される', async ({ page }) => {
    await page.goto('/users')

    await expect(page.getByRole('heading', { level: 1, name: '利用者一覧' })).toBeVisible()
    await expect(page.getByText('アリス')).toBeVisible()
    await expect(page.getByText('ボブ')).toBeVisible()
  })

  test('利用者一覧からユーザー詳細ページへ遷移できる', async ({ page }) => {
    await page.goto('/users')

    // 最初のユーザーカードのリンクをクリック
    await page.getByTestId('userProfileLink').first().click()
    await expect(page).toHaveURL(/\/users\/\d+/)

    // 「○○さんの情報」見出しと、読書状況のセクション見出しが表示される
    await expect(page.getByRole('heading', { name: /さんの情報$/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: /現在読んでいる書籍/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: /今まで読んだ書籍/ })).toBeVisible()
  })

  test('マイページ（ユーザー詳細）が表示される', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'マイページ' }).click()

    await expect(page).toHaveURL(/\/users\/\d+/)
    await expect(page.getByRole('heading', { name: /さんの情報$/ })).toBeVisible()
  })
})
