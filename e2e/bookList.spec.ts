import { expect, test } from '@playwright/test'

/**
 * 書籍一覧・検索・フィルタのテスト
 *
 * src/app/bookList.tsx の表示と、キーワード検索・保管場所フィルタの動作を確認する。
 * アサーションは prisma/seed.ts のシードデータに依存する。
 */
test.describe('書籍一覧', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('シードの書籍が一覧表示される', async ({ page }) => {
    // 書籍タイルの画像（data-testid="bookImg"）が複数表示される
    const bookImages = page.getByTestId('bookImg')
    await expect(bookImages.first()).toBeVisible()
    expect(await bookImages.count()).toBeGreaterThan(1)

    // シードの代表的な書籍タイトルが表示される
    await expect(page.getByText('JavaScript 完全ガイド')).toBeVisible()
    await expect(page.getByText('TypeScript ハンドブック')).toBeVisible()
  })

  test('キーワード検索で書籍を絞り込める', async ({ page }) => {
    // 検索前にTypeScript書籍が表示されていることを確認
    await expect(page.getByText('TypeScript ハンドブック')).toBeVisible()

    await page.getByPlaceholder('書籍のタイトルで検索').fill('TypeScript')

    // TypeScript書籍は残り、無関係な書籍は消える
    await expect(page.getByText('TypeScript ハンドブック')).toBeVisible()
    await expect(page.getByText('データベース設計の基礎')).toHaveCount(0)
  })

  test('保管場所フィルタで書籍を絞り込める', async ({ page }) => {
    // 「3階 会議室」を選択（シードでは React開発入門 が会議室に配置）
    await page.getByRole('combobox').selectOption({ label: '3階 会議室' })

    await expect(page.getByText('React開発入門')).toBeVisible()
  })
})
