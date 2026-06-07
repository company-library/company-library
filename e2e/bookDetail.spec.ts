import { expect, test } from '@playwright/test'

/**
 * 書籍詳細ページのテスト
 *
 * 一覧から書籍タイルをクリックして詳細ページへ遷移し、主要な情報が表示されることを
 * 確認する。閲覧系に限定するため、貸出・返却・感想投稿などDBを変更する操作は行わず、
 * 各ボタンの存在確認までに留める。
 */
test.describe('書籍詳細', () => {
  test('一覧から書籍をクリックして詳細ページへ遷移できる', async ({ page }) => {
    await page.goto('/')

    // 「JavaScript 完全ガイド」のタイルをクリック
    await page.getByText('JavaScript 完全ガイド').first().click()
    await expect(page).toHaveURL(/\/books\/\d+/)

    // タイトル（h1）が表示される
    await expect(page.getByRole('heading', { level: 1, name: 'JavaScript 完全ガイド' })).toBeVisible()
  })

  test('在庫情報と主要な見出し・ボタンが表示される', async ({ page }) => {
    await page.goto('/')
    await page.getByText('JavaScript 完全ガイド').first().click()
    await expect(page).toHaveURL(/\/books\/\d+/)

    // 在庫情報（「○冊貸し出し可能」「(所蔵数: ○冊)」）
    await expect(page.getByText(/冊貸し出し可能/).first()).toBeVisible()
    await expect(page.getByText(/所蔵数:/).first()).toBeVisible()

    // アクションボタンの存在確認（クリックはしない）
    await expect(page.getByRole('button', { name: '借りる' })).toBeVisible()
    await expect(page.getByRole('button', { name: '返却する' })).toBeVisible()
    await expect(page.getByRole('button', { name: '感想を書く' })).toBeVisible()

    // セクション見出し
    await expect(page.getByRole('heading', { name: '借りているユーザー' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '感想' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '借りたユーザー' })).toBeVisible()
  })
})
