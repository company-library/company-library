'use client'

import { useCallback, useEffect, useState } from 'react'
import { getBooksWithMissingInfo, updateSelectedBooksInfo, updateSingleBookInfo } from './actions'

type UpdateResult = {
  message: string
  updatedCount: number
  totalProcessed: number
  noUpdateCount: number
  errorCount: number
  updatedIsbns: string[]
  noUpdateIsbns: string[]
  errorIsbns: string[]
  results: Array<{
    id: number
    isbn: string
    title: string
    updated?: Record<string, unknown>
    error?: string
  }>
}

type BookWithMissingInfo = {
  id: number
  title: string
  isbn: string
  description: string
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date | null
}

/**
 * 書籍情報更新管理ページ
 */
export default function UpdateBookInfoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<UpdateResult | null>(null)
  const [limit, setLimit] = useState(50)
  const [filter, setFilter] = useState('both')
  const [createdAfter, setCreatedAfter] = useState('')
  const [createdBefore, setCreatedBefore] = useState('')
  const [updatedAfter, setUpdatedAfter] = useState('')
  const [updatedBefore, setUpdatedBefore] = useState('')
  const [books, setBooks] = useState<BookWithMissingInfo[]>([])
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [updatingBookId, setUpdatingBookId] = useState<number | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt'>('createdAt')
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // 不足情報のある書籍一覧を読み込み
  const loadBooks = useCallback(async () => {
    setLoadingBooks(true)
    const result = await getBooksWithMissingInfo(
      limit,
      filter as 'description' | 'image' | 'both',
      createdAfter || undefined,
      createdBefore || undefined,
      updatedAfter || undefined,
      updatedBefore || undefined,
    )
    if (result.success) {
      // クライアントサイドでソート
      const sortedBooks = [...result.books].sort((a, b) => {
        const dateA = new Date(
          sortBy === 'createdAt' ? a.createdAt : a.updatedAt || new Date(0),
        ).getTime()
        const dateB = new Date(
          sortBy === 'createdAt' ? b.createdAt : b.updatedAt || new Date(0),
        ).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      })
      setBooks(sortedBooks)
    }
    setLoadingBooks(false)
  }, [filter, limit, sortOrder, sortBy, createdAfter, createdBefore, updatedAfter, updatedBefore])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const handleUpdateBooks = async (bookIds: number[]) => {
    setIsLoading(true)
    setResult(null)

    try {
      const data = await updateSelectedBooksInfo(bookIds)

      if (data.success) {
        setResult({
          message: data.message || '',
          updatedCount: data.updatedIsbns.length,
          totalProcessed: data.updatedIsbns.length + data.noUpdateIsbns.length + data.errorIsbns.length,
          noUpdateCount: data.noUpdateIsbns.length,
          errorCount: data.errorIsbns.length,
          updatedIsbns: data.updatedIsbns,
          noUpdateIsbns: data.noUpdateIsbns,
          errorIsbns: data.errorIsbns,
          results: data.results,
        })
      } else {
        setResult({
          message: data.message || '更新に失敗しました',
          updatedCount: 0,
          totalProcessed: 0,
          noUpdateCount: 0,
          errorCount: 0,
          updatedIsbns: [],
          noUpdateIsbns: [],
          errorIsbns: [],
          results: [],
        })
        return
      }

      // 成功した場合、書籍一覧を再読み込み
      if (data.updatedIsbns.length > 0) {
        await loadBooks()
      }
    } catch (error) {
      console.error('更新エラー:', error)
      setResult({
        message: '更新処理中にエラーが発生しました',
        updatedCount: 0,
        totalProcessed: 0,
        noUpdateCount: 0,
        errorCount: 0,
        updatedIsbns: [],
        noUpdateIsbns: [],
        errorIsbns: [],
        results: [],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSingleBook = async (bookId: number) => {
    setUpdatingBookId(bookId)
    try {
      const result = await updateSingleBookInfo(bookId)
      if (result.success) {
        // 書籍一覧を再読み込み
        await loadBooks()
        alert(result.message)
      } else {
        alert(`エラー: ${result.message}`)
      }
    } catch (error) {
      console.error('個別更新エラー:', error)
      alert('更新中にエラーが発生しました')
    } finally {
      setUpdatingBookId(null)
    }
  }

  // チェックボックス関連のハンドラー
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedBookIds(books.map((book) => book.id))
    } else {
      setSelectedBookIds([])
    }
  }

  const handleSelectBook = (bookId: number, checked: boolean) => {
    if (checked) {
      setSelectedBookIds((prev) => [...prev, bookId])
    } else {
      setSelectedBookIds((prev) => prev.filter((id) => id !== bookId))
    }
  }

  // 選択された書籍の更新
  const handleUpdateSelectedBooks = async () => {
    if (selectedBookIds.length === 0) {
      alert('更新する書籍を選択してください')
      return
    }
    await handleUpdateBooks(selectedBookIds)
    setSelectedBookIds([])
    setSelectAll(false)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">書籍情報更新管理</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">書籍の不足情報を更新</h2>
        <p className="text-gray-600 mb-4">
          説明文が空または画像URLがnullの書籍について、Google Books APIとOpenBD
          APIから情報を取得して更新します。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-2">
              更新件数上限
            </label>
            <input
              type="number"
              id="limit"
              min="1"
              max="50"
              value={limit}
              onChange={(e) =>
                setLimit(Math.min(50, Math.max(1, Number.parseInt(e.target.value, 10) || 1)))
              }
              className="input input-bordered w-full"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-500">（最大50件）</span>
          </div>

          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
              絞り込み
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="select select-bordered w-full"
              disabled={isLoading}
            >
              <option value="both">説明文・画像の両方なし</option>
              <option value="description">説明文のみなし</option>
              <option value="image">画像のみなし</option>
            </select>
          </div>

          <div>
            <label htmlFor="createdAfter" className="block text-sm font-medium text-gray-700 mb-2">
              作成日（開始）
            </label>
            <input
              type="date"
              id="createdAfter"
              value={createdAfter}
              onChange={(e) => setCreatedAfter(e.target.value)}
              className="input input-bordered w-full"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="createdBefore" className="block text-sm font-medium text-gray-700 mb-2">
              作成日（終了）
            </label>
            <input
              type="date"
              id="createdBefore"
              value={createdBefore}
              onChange={(e) => setCreatedBefore(e.target.value)}
              className="input input-bordered w-full"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="updatedAfter" className="block text-sm font-medium text-gray-700 mb-2">
              更新日（開始）
            </label>
            <input
              type="date"
              id="updatedAfter"
              value={updatedAfter}
              onChange={(e) => setUpdatedAfter(e.target.value)}
              className="input input-bordered w-full"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="updatedBefore" className="block text-sm font-medium text-gray-700 mb-2">
              更新日（終了）
            </label>
            <input
              type="date"
              id="updatedBefore"
              value={updatedBefore}
              onChange={(e) => setUpdatedBefore(e.target.value)}
              className="input input-bordered w-full"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>重要:</strong> 更新処理は作成日の新しい順で実行されます。
            上限件数を50件に設定した場合、最新の50件が更新対象となります。
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleUpdateBooks(books.map((book) => book.id))}
          disabled={isLoading}
          className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? '更新中...' : '表示中の書籍の情報を更新'}
        </button>
      </div>

      {result && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">一括更新結果</h3>

          <div className="mb-6">
            <p className="text-lg mb-3">{result.message}</p>

            {/* サマリー統計 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{result.totalProcessed}</div>
                <div className="text-sm text-blue-800">処理件数</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center cursor-pointer group">
                <div className="text-2xl font-bold text-green-600">{result.updatedCount}</div>
                <div className="text-sm text-green-800">新規情報あり</div>
                {result.updatedIsbns.length > 0 && (
                  <div className="mt-2 text-xs text-green-700 group-hover:bg-green-100 p-1 rounded max-h-16 overflow-y-auto">
                    ISBN: {result.updatedIsbns.join(', ')}
                  </div>
                )}
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center cursor-pointer group">
                <div className="text-2xl font-bold text-gray-600">{result.noUpdateCount}</div>
                <div className="text-sm text-gray-800">新規情報無し</div>
                {result.noUpdateIsbns.length > 0 && (
                  <div className="mt-2 text-xs text-gray-700 group-hover:bg-gray-100 p-1 rounded max-h-16 overflow-y-auto">
                    ISBN: {result.noUpdateIsbns.join(', ')}
                  </div>
                )}
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center cursor-pointer group">
                <div className="text-2xl font-bold text-red-600">{result.errorCount}</div>
                <div className="text-sm text-red-800">エラー発生</div>
                {result.errorIsbns.length > 0 && (
                  <div className="mt-2 text-xs text-red-700 group-hover:bg-red-100 p-1 rounded max-h-16 overflow-y-auto">
                    ISBN: {result.errorIsbns.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {result.results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ISBN</th>
                    <th>タイトル</th>
                    <th>更新内容</th>
                    <th>ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.isbn}</td>
                      <td className="max-w-xs truncate">{item.title}</td>
                      <td>
                        {item.updated && (
                          <ul className="text-sm">
                            {Object.keys(item.updated).map((key) => (
                              <li key={key} className="text-green-600">
                                {key === 'description' ? '説明文' : '画像URL'} を更新
                              </li>
                            ))}
                          </ul>
                        )}
                        {!item.updated && !item.error && (
                          <span className="text-gray-500">更新不要</span>
                        )}
                      </td>
                      <td>
                        {item.error ? (
                          <span className="text-red-600">エラー</span>
                        ) : item.updated ? (
                          <span className="text-green-600">成功</span>
                        ) : (
                          <span className="text-gray-500">スキップ</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 不足情報のある書籍一覧 */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">
              不足情報のある書籍一覧
              {!loadingBooks && (
                <span className="text-sm font-normal text-gray-600 ml-2">（{books.length}件）</span>
              )}
            </h3>
            {selectedBookIds.length > 0 && (
              <button
                type="button"
                onClick={handleUpdateSelectedBooks}
                disabled={isLoading}
                className={`btn btn-secondary btn-sm ${isLoading ? 'loading' : ''}`}
              >
                選択した{selectedBookIds.length}件を更新
              </button>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-600 space-x-4">
            <div className="flex items-center space-x-1">
              <span>📋 ソート:</span>
              <span
                className={`px-2 py-1 rounded ${sortBy === 'createdAt' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              >
                作成日 {sortBy === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
              </span>
              <span
                className={`px-2 py-1 rounded ${sortBy === 'updatedAt' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              >
                更新日 {sortBy === 'updatedAt' && (sortOrder === 'desc' ? '↓' : '↑')}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              ※ カラムヘッダーをクリックして並び順を変更できます
            </div>
          </div>
        </div>

        {loadingBooks ? (
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : books.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            すべての書籍に説明文と画像が設定されています
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>
                    <label className="cursor-pointer label">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="checkbox checkbox-sm"
                      />
                    </label>
                  </th>
                  <th>ID</th>
                  <th>タイトル</th>
                  <th>ISBN</th>
                  <th>説明文</th>
                  <th>画像</th>
                  <th>
                    <button
                      type="button"
                      onClick={() => {
                        if (sortBy === 'createdAt') {
                          setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                        } else {
                          setSortBy('createdAt')
                          setSortOrder('desc')
                        }
                      }}
                      className={`flex items-center space-x-1 hover:text-blue-600 ${
                        sortBy === 'createdAt' ? 'text-blue-600 font-semibold' : ''
                      }`}
                      disabled={loadingBooks}
                    >
                      <span>作成日</span>
                      {sortBy === 'createdAt' && (
                        <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      onClick={() => {
                        if (sortBy === 'updatedAt') {
                          setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                        } else {
                          setSortBy('updatedAt')
                          setSortOrder('desc')
                        }
                      }}
                      className={`flex items-center space-x-1 hover:text-blue-600 ${
                        sortBy === 'updatedAt' ? 'text-blue-600 font-semibold' : ''
                      }`}
                      disabled={loadingBooks}
                    >
                      <span>更新日</span>
                      {sortBy === 'updatedAt' && (
                        <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </button>
                  </th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>
                      <label className="cursor-pointer label">
                        <input
                          type="checkbox"
                          checked={selectedBookIds.includes(book.id)}
                          onChange={(e) => handleSelectBook(book.id, e.target.checked)}
                          className="checkbox checkbox-sm"
                        />
                      </label>
                    </td>
                    <td>{book.id}</td>
                    <td className="max-w-xs truncate">{book.title}</td>
                    <td>{book.isbn}</td>
                    <td>
                      {book.description === '' ? (
                        <span className="text-red-600">空</span>
                      ) : (
                        <span className="text-green-600">あり</span>
                      )}
                    </td>
                    <td>
                      {book.imageUrl === null ? (
                        <span className="text-red-600">なし</span>
                      ) : (
                        <span className="text-green-600">あり</span>
                      )}
                    </td>
                    <td className="text-sm text-gray-600">
                      {new Date(book.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="text-sm text-gray-600">
                      {book.updatedAt ? new Date(book.updatedAt).toLocaleDateString('ja-JP') : '-'}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleUpdateSingleBook(book.id)}
                        disabled={updatingBookId === book.id}
                        className={`btn btn-sm btn-primary ${
                          updatingBookId === book.id ? 'loading' : ''
                        }`}
                      >
                        {updatingBookId === book.id ? '更新中...' : '更新'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
