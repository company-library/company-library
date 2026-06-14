import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as actions from './actions'
import UpdateBookInfoPage from './page'

// actions モジュールをモック
vi.mock('./actions', () => ({
  getBooksWithMissingInfo: vi.fn(),
  updateBooksInfo: vi.fn(),
}))

const mockGetBooksWithMissingInfo = actions.getBooksWithMissingInfo as ReturnType<typeof vi.fn>
const mockUpdateBooksInfo = actions.updateBooksInfo as ReturnType<typeof vi.fn>

// fetch をモック
global.fetch = vi.fn()
const _mockFetch = fetch as ReturnType<typeof vi.fn>

describe('UpdateBookInfoPage', () => {
  // テストデータ
  const mockBooks = [
    {
      id: 1,
      title: 'テスト書籍1',
      isbn: '9784000000001',
      description: '',
      imageUrl: null,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-20'),
    },
    {
      id: 2,
      title: 'テスト書籍2',
      isbn: '9784000000002',
      description: '説明あり',
      imageUrl: null,
      createdAt: new Date('2023-02-15'),
      updatedAt: null,
    },
  ]

  // ヘルパー関数
  const clickUpdatedAtSortButton = async () => {
    await waitFor(() => {
      const updatedAtButtons = screen.getAllByText('更新日')
      const tableHeaderButton = updatedAtButtons.find((el) => el.closest('button') !== null)
      const button = tableHeaderButton?.closest('button')
      if (button) {
        fireEvent.click(button)
      }
    })
  }

  const getSortButton = (text: string) => {
    const buttons = screen.getAllByText(text)
    return buttons.find((el) => el.closest('button') !== null)?.closest('button')
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetBooksWithMissingInfo.mockResolvedValue({
      success: true,
      books: mockBooks,
      count: mockBooks.length,
    })
  })

  describe('基本的なレンダリング', () => {
    it('ページが正常にレンダリングされる', async () => {
      render(<UpdateBookInfoPage />)

      expect(screen.getByText('書籍情報更新管理')).toBeInTheDocument()
      expect(screen.getByText('書籍の不足情報を更新')).toBeInTheDocument()
      expect(screen.getByText('不足情報のある書籍一覧')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('テスト書籍1')).toBeInTheDocument()
        expect(screen.getByText('テスト書籍2')).toBeInTheDocument()
        // 更新日がある書籍は日付が表示される（2023/1/20）
        expect(screen.getByText('2023/1/20')).toBeInTheDocument()
        // 更新日がない書籍は「-」が表示される
        const dashElements = screen.getAllByText('-')
        expect(dashElements.length).toBeGreaterThan(0)
      })
    })

    it('ローディング状態が正しく表示される', () => {
      mockGetBooksWithMissingInfo.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000)),
      )

      render(<UpdateBookInfoPage />)

      expect(document.querySelector('.loading-spinner')).toBeInTheDocument()
    })

    it('書籍が0件の場合のメッセージが表示される', async () => {
      mockGetBooksWithMissingInfo.mockResolvedValue({
        success: true,
        books: [],
        count: 0,
      })

      render(<UpdateBookInfoPage />)

      await waitFor(() => {
        expect(screen.getByText('すべての書籍に説明文と画像が設定されています')).toBeInTheDocument()
      })
    })

    it('書籍一覧のタイトルがリンクとして表示される', async () => {
      render(<UpdateBookInfoPage />)

      await waitFor(() => {
        // タイトルがリンクとして表示されることを確認
        const titleLinks = screen.getAllByRole('link')
        expect(titleLinks).toHaveLength(2) // 2つの書籍タイトルがリンクになっている

        // 最初の書籍のリンクのhref属性を確認
        const firstTitleLink = titleLinks.find((link) => link.textContent === 'テスト書籍1')
        expect(firstTitleLink).toHaveAttribute('href', '/books/1')

        // 2番目の書籍のリンクのhref属性を確認
        const secondTitleLink = titleLinks.find((link) => link.textContent === 'テスト書籍2')
        expect(secondTitleLink).toHaveAttribute('href', '/books/2')
      })
    })
  })

  describe('フィルタリング機能', () => {
    it('作成日と更新日が設定されると、getBooksWithMissingInfoに渡される', async () => {
      render(<UpdateBookInfoPage />)

      const createdAfterInput = screen.getByLabelText('作成日（開始）')
      const createdBeforeInput = screen.getByLabelText('作成日（終了）')
      const updatedAfterInput = screen.getByLabelText('更新日（開始）')
      const updatedBeforeInput = screen.getByLabelText('更新日（終了）')

      fireEvent.change(createdAfterInput, { target: { value: '2023-01-01' } })
      fireEvent.change(createdBeforeInput, { target: { value: '2023-06-30' } })
      fireEvent.change(updatedAfterInput, { target: { value: '2023-07-01' } })
      fireEvent.change(updatedBeforeInput, { target: { value: '2023-12-31' } })

      await waitFor(() => {
        expect(mockGetBooksWithMissingInfo).toHaveBeenCalledWith(
          50,
          'both',
          '2023-01-01',
          '2023-06-30',
          '2023-07-01',
          '2023-12-31',
        )
      })
    })

    it('フィルター条件を変更すると書籍一覧が更新される', async () => {
      render(<UpdateBookInfoPage />)

      const filterSelect = screen.getByDisplayValue('説明文・画像の両方なし')
      fireEvent.change(filterSelect, { target: { value: 'description' } })

      await waitFor(() => {
        expect(mockGetBooksWithMissingInfo).toHaveBeenCalledWith(
          50,
          'description',
          undefined,
          undefined,
          undefined,
          undefined,
        )
      })
    })
  })

  describe('ソート機能', () => {
    it('作成日の並び順を変更できる', async () => {
      render(<UpdateBookInfoPage />)

      await waitFor(() => {
        const sortButton = screen.getByText('作成日')
        fireEvent.click(sortButton)
      })

      expect(mockGetBooksWithMissingInfo).toHaveBeenCalled()
    })

    it('更新日でソートできる', async () => {
      render(<UpdateBookInfoPage />)

      await clickUpdatedAtSortButton()

      expect(mockGetBooksWithMissingInfo).toHaveBeenCalled()
    })

    it('ソートカラムの切り替えが正しく動作する', async () => {
      render(<UpdateBookInfoPage />)

      // 最初は作成日でソート（デフォルト）
      await waitFor(() => {
        expect(screen.getByText('作成日')).toBeInTheDocument()
      })

      // テーブルヘッダーの更新日ボタンをクリック
      await clickUpdatedAtSortButton()

      // 作成日をもう一度クリックして作成日ソートに戻す
      await waitFor(() => {
        const createdAtButton = getSortButton('作成日')
        if (createdAtButton) {
          fireEvent.click(createdAtButton)
        }
      })

      expect(mockGetBooksWithMissingInfo).toHaveBeenCalled()
    })

    it('同じソートカラムをクリックすると昇順・降順が切り替わる', async () => {
      render(<UpdateBookInfoPage />)

      await waitFor(() => {
        const sortButton = screen.getByText('作成日')
        // 最初のクリック（既に作成日でソート中なので順序切り替え）
        fireEvent.click(sortButton)
      })

      await waitFor(() => {
        const sortButton = screen.getByText('作成日')
        // 二度目のクリック（順序再切り替え）
        fireEvent.click(sortButton)
      })

      expect(mockGetBooksWithMissingInfo).toHaveBeenCalled()
    })

    it('更新日でソート時にnullの書籍が最後に表示される', async () => {
      const booksWithMixedUpdatedAt = [
        {
          id: 1,
          title: 'テスト書籍1（更新日null）',
          isbn: '9784000000001',
          description: '',
          imageUrl: null,
          createdAt: new Date('2023-01-15'),
          updatedAt: null,
        },
        {
          id: 2,
          title: 'テスト書籍2（更新日あり）',
          isbn: '9784000000002',
          description: '',
          imageUrl: null,
          createdAt: new Date('2023-02-15'),
          updatedAt: new Date('2023-02-20'),
        },
      ]

      mockGetBooksWithMissingInfo.mockResolvedValue({
        success: true,
        books: booksWithMixedUpdatedAt,
        count: booksWithMixedUpdatedAt.length,
      })

      render(<UpdateBookInfoPage />)

      // 更新日がnullの書籍が正しく表示される
      await waitFor(() => {
        expect(screen.getByText('-')).toBeInTheDocument()
        expect(screen.getByText('2023/2/20')).toBeInTheDocument()
      })

      // 更新日でソートボタンをクリック
      await clickUpdatedAtSortButton()

      await waitFor(() => {
        // 更新日がある書籍が先頭、nullの書籍が後に並ぶ
        const titles = screen.getAllByText(/テスト書籍/)
        expect(titles[0]).toHaveTextContent('テスト書籍2（更新日あり）')
      })
    })
  })

  describe('書籍情報更新機能', () => {
    it('表示中の書籍の情報を更新ボタンで表示中のbookIdsが渡される', async () => {
      mockUpdateBooksInfo.mockResolvedValue({
        success: true,
        message: '2件の書籍情報を更新しました',
        updatedCount: 2,
        totalProcessed: 2,
        noUpdateCount: 0,
        errorCount: 0,
        updatedIsbns: ['9784000000001', '9784000000002'],
        noUpdateIsbns: [],
        errorIsbns: [],
        results: [],
      })

      render(<UpdateBookInfoPage />)

      // 書籍一覧が読み込まれるのを待つ
      await waitFor(() => {
        expect(screen.getByText('テスト書籍1')).toBeInTheDocument()
        expect(screen.getByText('テスト書籍2')).toBeInTheDocument()
      })

      const updateButton = screen.getByText('表示中の書籍の情報を更新')
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockUpdateBooksInfo).toHaveBeenCalledWith({
          bookIds: expect.arrayContaining([1, 2]),
        })
      })
    })

    it('チェックボックスで一件だけ選択し、更新できる', async () => {
      mockUpdateBooksInfo.mockResolvedValue({
        success: true,
        message: '1件の書籍情報を更新しました',
        updatedCount: 1,
        totalProcessed: 1,
        noUpdateCount: 0,
        errorCount: 0,
        updatedIsbns: ['9784000000001'],
        noUpdateIsbns: [],
        errorIsbns: [],
        results: [],
      })

      render(<UpdateBookInfoPage />)

      await waitFor(() => {
        // 最初の書籍のチェックボックスを選択
        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[1]) // 最初のチェックボックスは全選択用なので2番目を選択
      })

      await waitFor(() => {
        // 選択した書籍の更新ボタンをクリック
        const updateSelectedButton = screen.getByText(/選択した.*件を更新/)
        fireEvent.click(updateSelectedButton)
      })

      await waitFor(() => {
        expect(mockUpdateBooksInfo).toHaveBeenCalledWith({
          bookIds: expect.arrayContaining([expect.any(Number)]),
        })
      })
    })

    it('全選択チェックボックスで全書籍を選択し、更新できる', async () => {
      mockUpdateBooksInfo.mockResolvedValue({
        success: true,
        message: '2件の書籍情報を更新しました',
        updatedCount: 2,
        totalProcessed: 2,
        noUpdateCount: 0,
        errorCount: 0,
        updatedIsbns: ['9784000000001', '9784000000002'],
        noUpdateIsbns: [],
        errorIsbns: [],
        results: [],
      })

      render(<UpdateBookInfoPage />)

      await waitFor(() => {
        // 全選択チェックボックスを選択
        const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(selectAllCheckbox)
      })

      await waitFor(() => {
        // 全選択された書籍の更新ボタンをクリック
        const updateSelectedButton = screen.getByText(/選択した.*件を更新/)
        fireEvent.click(updateSelectedButton)
      })

      await waitFor(() => {
        expect(mockUpdateBooksInfo).toHaveBeenCalledWith({
          bookIds: expect.arrayContaining([1, 2]),
        })
      })
    })

    it('個別更新が正常に動作する', async () => {
      mockUpdateBooksInfo.mockResolvedValue({
        success: true,
        message: '書籍情報を更新しました',
        updatedFields: ['description'],
      })

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      render(<UpdateBookInfoPage />)

      await waitFor(() => {
        const updateButtons = screen.getAllByText('更新')
        fireEvent.click(updateButtons[0])
      })

      await waitFor(() => {
        expect(mockUpdateBooksInfo).toHaveBeenCalledWith({ bookIds: [expect.any(Number)] })
        expect(alertSpy).toHaveBeenCalledWith('書籍情報を更新しました')
      })

      alertSpy.mockRestore()
    })

    it('個別更新でエラーが発生した場合、エラーが表示される', async () => {
      mockUpdateBooksInfo.mockResolvedValue({
        success: false,
        message: '更新に失敗しました',
      })

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      render(<UpdateBookInfoPage />)

      await waitFor(() => {
        const updateButtons = screen.getAllByText('更新')
        fireEvent.click(updateButtons[0])
      })

      await waitFor(() => {
        expect(mockUpdateBooksInfo).toHaveBeenCalledWith({ bookIds: [expect.any(Number)] })
        expect(alertSpy).toHaveBeenCalledWith('エラー: 更新に失敗しました')
      })

      alertSpy.mockRestore()
    })
  })
})
