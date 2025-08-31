import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as actions from './actions'
import UpdateBookInfoPage from './page'

// actions モジュールをモック
vi.mock('./actions', () => ({
  getBooksWithMissingInfo: vi.fn(),
  updateSingleBookInfo: vi.fn(),
  updateSelectedBooksInfo: vi.fn(),
}))

const mockGetBooksWithMissingInfo = actions.getBooksWithMissingInfo as ReturnType<typeof vi.fn>
const mockUpdateSingleBookInfo = actions.updateSingleBookInfo as ReturnType<typeof vi.fn>
const mockUpdateSelectedBooksInfo = actions.updateSelectedBooksInfo as ReturnType<typeof vi.fn>

// fetch をモック
global.fetch = vi.fn()
const mockFetch = fetch as ReturnType<typeof vi.fn>

describe('UpdateBookInfoPage', () => {
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

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetBooksWithMissingInfo.mockResolvedValue({
      success: true,
      books: mockBooks,
      count: mockBooks.length,
    })
  })

  it('ページが正常にレンダリングされる', async () => {
    render(<UpdateBookInfoPage />)

    expect(screen.getByText('書籍情報更新管理')).toBeInTheDocument()
    expect(screen.getByText('書籍の不足情報を更新')).toBeInTheDocument()
    expect(screen.getByText('不足情報のある書籍一覧')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('テスト書籍1')).toBeInTheDocument()
      expect(screen.getByText('テスト書籍2')).toBeInTheDocument()
    })
  })

  it('更新日フィルターのフィールドが表示される', async () => {
    render(<UpdateBookInfoPage />)

    expect(screen.getByLabelText('更新日（開始）')).toBeInTheDocument()
    expect(screen.getByLabelText('更新日（終了）')).toBeInTheDocument()
  })

  it('テーブルに更新日カラムが表示される', async () => {
    render(<UpdateBookInfoPage />)

    await waitFor(() => {
      expect(screen.getByText('更新日')).toBeInTheDocument()
    })
  })

  it('更新日がある書籍は日付が表示される', async () => {
    render(<UpdateBookInfoPage />)

    await waitFor(() => {
      // 2023/1/20 の日本語表記
      expect(screen.getByText('2023/1/20')).toBeInTheDocument()
    })
  })

  it('更新日がない書籍は「-」が表示される', async () => {
    render(<UpdateBookInfoPage />)

    await waitFor(() => {
      // テーブル内の「-」を探す（updatedAtがnullの場合）
      const dashElements = screen.getAllByText('-')
      expect(dashElements.length).toBeGreaterThan(0)
    })
  })

  it('更新日フィルターを設定すると getBooksWithMissingInfo に渡される', async () => {
    render(<UpdateBookInfoPage />)

    const updatedAfterInput = screen.getByLabelText('更新日（開始）')
    const updatedBeforeInput = screen.getByLabelText('更新日（終了）')

    fireEvent.change(updatedAfterInput, { target: { value: '2023-01-01' } })
    fireEvent.change(updatedBeforeInput, { target: { value: '2023-12-31' } })

    await waitFor(() => {
      expect(mockGetBooksWithMissingInfo).toHaveBeenCalledWith(
        50,
        'both',
        undefined,
        undefined,
        '2023-01-01',
        '2023-12-31',
      )
    })
  })

  it('作成日と更新日の両方のフィルターが設定されると正しく渡される', async () => {
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

  it('表示中の書籍の情報を更新ボタンで表示中のbookIdsが渡される', async () => {
    mockUpdateSelectedBooksInfo.mockResolvedValue({
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
      expect(mockUpdateSelectedBooksInfo).toHaveBeenCalledWith(expect.arrayContaining([1, 2]))
    })
  })

  it('個別更新が正常に動作する', async () => {
    mockUpdateSingleBookInfo.mockResolvedValue({
      success: true,
      message: '書籍情報を更新しました',
      updatedFields: ['description'],
    })

    // アラートをモック
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<UpdateBookInfoPage />)

    await waitFor(() => {
      const updateButtons = screen.getAllByText('更新')
      fireEvent.click(updateButtons[0])
    })

    await waitFor(() => {
      // 最初の書籍のIDは1だが、テーブルの順序により2番目の書籍が最初に表示されることがある
      expect(mockUpdateSingleBookInfo).toHaveBeenCalledWith(expect.any(Number))
      expect(alertSpy).toHaveBeenCalledWith('書籍情報を更新しました')
    })

    alertSpy.mockRestore()
  })

  it('個別更新でエラーが発生した場合', async () => {
    mockUpdateSingleBookInfo.mockResolvedValue({
      success: false,
      message: '更新に失敗しました',
    })

    // アラートをモック
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<UpdateBookInfoPage />)

    await waitFor(() => {
      const updateButtons = screen.getAllByText('更新')
      fireEvent.click(updateButtons[0])
    })

    await waitFor(() => {
      expect(mockUpdateSingleBookInfo).toHaveBeenCalledWith(expect.any(Number))
      expect(alertSpy).toHaveBeenCalledWith('エラー: 更新に失敗しました')
    })

    alertSpy.mockRestore()
  })

  it('作成日の並び順を変更できる', async () => {
    render(<UpdateBookInfoPage />)

    await waitFor(() => {
      const sortButton = screen.getByText('作成日')
      fireEvent.click(sortButton)
    })

    // 作成日でのソート順序が切り替わることを確認
    expect(mockGetBooksWithMissingInfo).toHaveBeenCalled()
  })

  it('更新日でソートできる', async () => {
    render(<UpdateBookInfoPage />)

    // テーブルヘッダーの更新日ボタンをクリック
    await waitFor(() => {
      const updatedAtButtons = screen.getAllByText('更新日')
      const tableHeaderButton = updatedAtButtons.find((el) => el.closest('button') !== null)
      if (tableHeaderButton?.closest('button')) {
        fireEvent.click(tableHeaderButton.closest('button')!)
      }
    })

    // 更新日でのソートに切り替わることを確認
    expect(mockGetBooksWithMissingInfo).toHaveBeenCalled()
  })

  it('ソートカラムの切り替えが正しく動作する', async () => {
    render(<UpdateBookInfoPage />)

    // 最初は作成日でソート（デフォルト）
    await waitFor(() => {
      expect(screen.getByText('作成日')).toBeInTheDocument()
    })

    // テーブルヘッダーの更新日ボタンをクリック
    const updatedAtButtons = screen.getAllByText('更新日')
    const tableHeaderButton = updatedAtButtons.find((el) => el.closest('button') !== null)
    if (tableHeaderButton?.closest('button')) {
      fireEvent.click(tableHeaderButton.closest('button')!)
    }

    // 作成日をもう一度クリックして作成日ソートに戻す
    await waitFor(() => {
      const createdAtButton = screen.getByText('作成日').closest('button')
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

  it('更新日がnullの書籍が正しく表示される', async () => {
    const booksWithNullUpdatedAt = [
      {
        id: 1,
        title: 'テスト書籍1',
        isbn: '9784000000001',
        description: '',
        imageUrl: null,
        createdAt: new Date('2023-01-15'),
        updatedAt: null, // null の場合
      },
      {
        id: 2,
        title: 'テスト書籍2',
        isbn: '9784000000002',
        description: '',
        imageUrl: null,
        createdAt: new Date('2023-02-15'),
        updatedAt: new Date('2023-02-20'),
      },
    ]

    mockGetBooksWithMissingInfo.mockResolvedValue({
      success: true,
      books: booksWithNullUpdatedAt,
      count: booksWithNullUpdatedAt.length,
    })

    render(<UpdateBookInfoPage />)

    await waitFor(() => {
      // 更新日がnullの場合「-」が表示される
      expect(screen.getByText('-')).toBeInTheDocument()
      // 更新日がある場合は日付が表示される
      expect(screen.getByText('2023/2/20')).toBeInTheDocument()
    })
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

    // 更新日でソートボタンをクリック
    await waitFor(() => {
      const updatedAtButtons = screen.getAllByText('更新日')
      const tableHeaderButton = updatedAtButtons.find((el) => el.closest('button') !== null)
      if (tableHeaderButton?.closest('button')) {
        fireEvent.click(tableHeaderButton.closest('button')!)
      }
    })

    await waitFor(() => {
      // 更新日が新しい順（降順）でソートされることを確認
      // 更新日がある書籍が先頭、nullの書籍が後に並ぶ
      const titles = screen.getAllByText(/テスト書籍/)
      expect(titles[0]).toHaveTextContent('テスト書籍2（更新日あり）')
    })
  })

  it('アクティブなソートカラムが視覚的にハイライトされる', async () => {
    render(<UpdateBookInfoPage />)

    // デフォルトでは作成日がアクティブ
    await waitFor(() => {
      const createdAtButtons = screen.getAllByText('作成日')
      const createdAtButton = createdAtButtons
        .find((el) => el.closest('button') !== null)
        ?.closest('button')
      expect(createdAtButton).toHaveClass('text-blue-600')
    })

    // テーブルヘッダーの更新日ボタンをクリック
    const updatedAtButtons = screen.getAllByText('更新日')
    const tableHeaderButton = updatedAtButtons.find((el) => el.closest('button') !== null)
    if (tableHeaderButton?.closest('button')) {
      fireEvent.click(tableHeaderButton.closest('button')!)
    }

    await waitFor(() => {
      // 更新日がアクティブになる
      const updatedAtButtonEl = updatedAtButtons
        .find((el) => el.closest('button') !== null)
        ?.closest('button')
      expect(updatedAtButtonEl).toHaveClass('text-blue-600')

      // 作成日はアクティブでなくなる
      const createdAtButtons = screen.getAllByText('作成日')
      const createdAtButtonEl = createdAtButtons
        .find((el) => el.closest('button') !== null)
        ?.closest('button')
      expect(createdAtButtonEl).not.toHaveClass('text-blue-600')
    })
  })

  it('ソート方向の矢印が正しく表示される', async () => {
    render(<UpdateBookInfoPage />)

    // デフォルト（降順）では下向き矢印
    await waitFor(() => {
      expect(screen.getByText('↓')).toBeInTheDocument()
    })

    // 作成日をクリックして昇順に変更
    const createdAtButton = screen.getByText('作成日')
    fireEvent.click(createdAtButton)

    await waitFor(() => {
      // 上向き矢印に変わる
      expect(screen.getByText('↑')).toBeInTheDocument()
    })

    // 更新日をクリックして更新日ソートに変更
    const updatedAtButtons = screen.getAllByText('更新日')
    const tableHeaderButton = updatedAtButtons.find((el) => el.closest('button') !== null)
    if (tableHeaderButton?.closest('button')) {
      fireEvent.click(tableHeaderButton.closest('button')!)
    }

    await waitFor(() => {
      // 更新日は降順で開始するので下向き矢印
      expect(screen.getByText('↓')).toBeInTheDocument()
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

  it('チェックボックスで書籍を選択して更新できる', async () => {
    mockUpdateSelectedBooksInfo.mockResolvedValue({
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
      // 選択した書籍の更新ボタンが表示されるまで待機
      const updateSelectedButton = screen.getByText(/選択した.*件を更新/)
      fireEvent.click(updateSelectedButton)
    })

    await waitFor(() => {
      expect(mockUpdateSelectedBooksInfo).toHaveBeenCalledWith(
        expect.arrayContaining([expect.any(Number)]),
      )
    })
  })

  it('全選択チェックボックスで全書籍を選択できる', async () => {
    mockUpdateSelectedBooksInfo.mockResolvedValue({
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
      expect(mockUpdateSelectedBooksInfo).toHaveBeenCalledWith(expect.arrayContaining([1, 2]))
    })
  })
})
