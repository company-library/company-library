'use client'

import { useCallback, useEffect, useState } from 'react'
import { getBooksWithMissingInfo, updateSingleBookInfo } from './actions'

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
  _count: {
    registrationHistories: number
  }
}

/**
 * 書籍情報更新管理ページ
 */
export default function UpdateBookInfoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<UpdateResult | null>(null)
  const [limit, setLimit] = useState(10)
  const [filter, setFilter] = useState('both')
  const [createdAfter, setCreatedAfter] = useState('')
  const [isbn, setIsbn] = useState('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'isbn' | 'registrationCount'>(
    'createdAt',
  )
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [books, setBooks] = useState<BookWithMissingInfo[]>([])
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [updatingBookId, setUpdatingBookId] = useState<number | null>(null)

  // 不足情報のある書籍一覧を読み込み
  const loadBooks = useCallback(async () => {
    setLoadingBooks(true)
    const result = await getBooksWithMissingInfo(50, sortBy, sortOrder)
    if (result.success) {
      setBooks(result.books)
    }
    setLoadingBooks(false)
  }, [sortBy, sortOrder])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const handleUpdateBooks = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // クエリパラメータを構築
      const params = new URLSearchParams({
        limit: limit.toString(),
        filter,
        sortBy,
        sortOrder,
      })

      if (createdAfter) {
        params.append('createdAfter', createdAfter)
      }

      if (isbn.trim()) {
        params.append('isbn', isbn.trim())
      }

      const response = await fetch(`/api/books/update-missing-info?${params.toString()}`, {
        method: 'GET',
      })

      const data: UpdateResult = await response.json()
      setResult(data)

      // 成功した場合、書籍一覧を再読み込み
      if (data.updatedCount > 0) {
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">書籍情報更新管理</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">書籍の不足情報を更新</h2>
        <p className="text-gray-600 mb-4">
          説明文が空または画像URLがnullの書籍について、Google Books APIとOpenBD
          APIから情報を取得して更新します。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-2">
              更新件数上限
            </label>
            <input
              type="number"
              id="limit"
              min="1"
              max="20"
              value={limit}
              onChange={(e) =>
                setLimit(Math.min(20, Math.max(1, Number.parseInt(e.target.value, 10) || 1)))
              }
              className="input input-bordered w-full"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-500">（最大20件）</span>
          </div>

          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
              更新対象
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="select select-bordered w-full"
              disabled={isLoading}
            >
              <option value="both">説明文と画像の両方</option>
              <option value="description">説明文のみ</option>
              <option value="image">画像のみ</option>
            </select>
          </div>

          <div>
            <label htmlFor="createdAfter" className="block text-sm font-medium text-gray-700 mb-2">
              作成日以降（任意）
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
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
              ISBN指定（任意）
            </label>
            <input
              type="text"
              id="isbn"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="9784567890123"
              className="input input-bordered w-full"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
              並び順
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="select select-bordered w-full"
              disabled={isLoading || loadingBooks}
            >
              <option value="createdAt">作成日</option>
              <option value="title">タイトル</option>
              <option value="isbn">ISBN</option>
              <option value="registrationCount">登録数</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
              順序
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
              className="select select-bordered w-full"
              disabled={isLoading || loadingBooks}
            >
              <option value="asc">昇順</option>
              <option value="desc">降順</option>
            </select>
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>重要:</strong> 更新処理は画面に表示されている順序で実行されます。
            上限件数を10件に設定した場合、現在の並び順で先頭10件が更新対象となります。
          </p>
        </div>

        <button
          type="button"
          onClick={handleUpdateBooks}
          disabled={isLoading}
          className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? '更新中...' : '書籍情報を更新'}
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
        <h3 className="text-lg font-semibold mb-4">不足情報のある書籍一覧</h3>

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
                  <th>ID</th>
                  <th>タイトル</th>
                  <th>ISBN</th>
                  <th>説明文</th>
                  <th>画像</th>
                  <th>登録数</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
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
                    <td>{book._count.registrationHistories}</td>
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
