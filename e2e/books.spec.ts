import { expect, test } from '@playwright/test'

// シードデータのISBN（1111111111111〜4444444444444）と重複しない値を使用
const TEST_ISBN = '9784000000001'

test.describe('書籍ライフサイクル（登録 → 貸出 → 返却）', () => {
  test.beforeEach(async ({ page }) => {
    // Google Books API をモック
    // imageLinks を含まないことで downloadAndPutImage が undefined を返し
    // Vercel Blob へのアップロードをスキップする
    await page.route(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${TEST_ISBN}`,
      async (route) => {
        await route.fulfill({
          json: {
            items: [
              {
                volumeInfo: {
                  title: 'E2Eテスト用書籍',
                  description: 'E2Eテスト用の説明文です。自動テストにより登録された書籍です。',
                },
              },
            ],
          },
        })
      },
    )

    // OpenBD API をモック
    await page.route(
      `https://api.openbd.jp/v1/get?isbn=${TEST_ISBN}`,
      async (route) => {
        await route.fulfill({ json: [null] })
      },
    )
  })

  test('書籍の登録・貸出・返却ができる', async ({ page }) => {
    // ── 書籍登録 ────────────────────────────────────────────
    await page.goto('/books/register')

    await page.getByLabel('ISBN（13桁）を入力してください').fill(TEST_ISBN)

    // SWR がモックレスポンスを受け取り書籍情報を表示するのを待つ
    await expect(page.getByText('こちらの本でしょうか？')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('E2Eテスト用書籍')).toBeVisible()

    // 保管場所を選択（1階 エントランス）
    // /api/locations の初回コンパイル(devサーバ)に時間がかかる場合があるため
    // 選択肢が読み込まれるまで明示的に待つ
    await expect(page.locator('#location-select option').nth(1)).toBeAttached({
      timeout: 60_000,
    })
    await page.locator('#location-select').selectOption({ index: 1 })

    await page.getByRole('button', { name: '登録する' }).click()

    // Server Action 完了後 /books/{id} へリダイレクトされるのを待つ
    await page.waitForURL(/\/books\/\d+/, { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: 'E2Eテスト用書籍' })).toBeVisible()

    // ── 貸出 ────────────────────────────────────────────────
    const lendButton = page.getByRole('button', { name: '借りる' })
    await expect(lendButton).not.toBeDisabled()
    await lendButton.click()

    // 貸出ダイアログが開くのを待つ
    await expect(page.getByText('借りますか?')).toBeVisible()

    // 保管場所を選択（最初の選択肢）
    await page.locator('#locationSelect').selectOption({ index: 1 })

    // ダイアログ内の Ok ボタンをクリック
    await page.locator('dialog[open]').getByRole('button', { name: 'Ok' }).click()

    // 貸出完了：router.refresh() 後に返却するボタンが有効になるのを待つ
    await expect(page.getByRole('button', { name: '返却する' })).not.toBeDisabled({
      timeout: 15_000,
    })

    // ── 返却 ────────────────────────────────────────────────
    await page.getByRole('button', { name: '返却する' }).click()

    // 返却ダイアログが開くのを待つ
    await expect(page.getByText('返却しますか?')).toBeVisible()

    await page
      .locator('dialog[open]')
      .getByPlaceholder('感想を書いてください')
      .fill('E2Eテストからの返却感想です。大変参考になりました。')

    // ダイアログ内の Ok ボタンをクリック
    await page.locator('dialog[open]').getByRole('button', { name: 'Ok' }).click()

    // 返却完了：router.refresh() 後に返却するボタンが再び無効になるのを待つ
    await expect(page.getByRole('button', { name: '返却する' })).toBeDisabled({
      timeout: 15_000,
    })
    // 借りるボタンが再び有効になっていることを確認
    await expect(page.getByRole('button', { name: '借りる' })).not.toBeDisabled()
  })
})
