# React 19 移行計画

## 概要

React 19への移行に伴い、async Client Componentのサポートが廃止されました。
本プロジェクトのServer Componentは正しく実装されていますが、テストファイルに問題があります。

## 問題点

- テストファイルがServer ComponentをReact Testing Libraryで直接テストしようとしている
- React 19ではこれがエラーとなる
- 影響: 9ファイル、34テスト

## 影響を受けているファイル

### カテゴリA: ページコンポーネント（Server Component）
- [ ] `src/app/users/[id]/page.test.tsx`
- [ ] `src/app/users/page.test.tsx`
- [ ] `src/app/books/[id]/page.test.tsx`
- [ ] `src/app/books/register/page.test.tsx`

### カテゴリB: データ取得を含む子コンポーネント（Server Component）
- [ ] `src/app/users/[id]/bookList.test.tsx`
- [ ] `src/app/users/[id]/readingBookList.test.tsx`
- [ ] `src/app/books/[id]/bookDetail.test.tsx`

### カテゴリC: 認証を使用するコンポーネント（Server Component）
- [ ] `src/app/navigationBar.test.tsx`
- [ ] `src/app/users/userCard.test.tsx`

## 段階的な移行計画

### フェーズ1: テストの一時スキップ（短期対応）✓

**目的**: CIを通す状態を維持

**実装方法**:
- 問題のあるテストファイルに`test.skip`を追加
- またはvitestの設定で除外

**完了条件**:
- [ ] すべてのテストがスキップされる
- [ ] `yarn test`が成功する
- [ ] コミット作成

### フェーズ2: アーキテクチャ改善（中期対応）

**目的**: コンポーネントの責務を分離し、テスト可能にする

**対象コンポーネント**:
1. [ ] `bookList.tsx` - 優先度: 高
2. [ ] `readingBookList.tsx` - 優先度: 高
3. [ ] `bookDetail.tsx` - 優先度: 高
4. [ ] `navigationBar.tsx` - 優先度: 中
5. [ ] `userCard.tsx` - 優先度: 中

**実装パターン**:
```typescript
// Before: Server Component（データ取得 + 表示）
const BookList: FC<Props> = async ({ bookIds }) => {
  const books = await prisma.book.findMany(...)
  return <div>{/* 表示ロジック */}</div>
}

// After: 分離
// Server Component（データ取得のみ）
const BookList: FC<Props> = async ({ bookIds }) => {
  const books = await prisma.book.findMany(...)
  return <BookListClient books={books} />
}

// Client Component（表示のみ、テスト可能）
'use client'
const BookListClient: FC<{ books: Book[] }> = ({ books }) => {
  return <div>{/* 表示ロジック */}</div>
}
```

**各コンポーネントの実装手順**:
1. 表示用Client Componentを作成（`*Client.tsx`）
2. Server Componentを薄いラッパーに変更
3. Client Componentのテストを作成
4. 元のテストを削除
5. CIを通す
6. コミット

### フェーズ3: 長期的な改善（将来）

**目的**: E2Eテストでページコンポーネントをカバー

- [ ] Playwright等のE2Eツール導入検討
- [ ] 主要なユーザーフローのE2Eテスト作成
- [ ] ユニットテストのカバレッジ再評価

## 進捗管理

### 完了したタスク
- [x] React 19.2.4へのアップデート
- [x] 型チェックエラーの修正（`updatedAt`プロパティ追加）
- [x] 移行計画の作成

### 次のステップ
1. フェーズ1を完了させる
2. `bookList.tsx`から順にフェーズ2を実行
3. 各コンポーネント完了後にコミット

## 参考情報

### React 19の変更点
- async Client Componentは非サポート
- Server Componentのみがasyncになれる
- Client Componentで非同期処理が必要な場合はuseEffect等を使用

### Next.js 15のベストプラクティス
- データ取得はServer Componentで行う
- インタラクティブな部分のみClient Componentに
- Client Componentは可能な限り小さく保つ
