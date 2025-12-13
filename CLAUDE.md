# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 言語設定

**重要: このプロジェクトでは、常に日本語でコミュニケーションを取ってください。**

- すべての説明、コメント、レスポンスは日本語で記述すること
- エラーメッセージやログ出力も日本語を使用すること
- コードレビューやテスト結果の説明も日本語で行うこと
- 技術的な専門用語は英語のままでも構いませんが、説明は日本語で行うこと

## よく使用する開発コマンド

### 開発サーバー
```bash
yarn dev                    # 開発サーバーを起動
yarn build                  # プロダクション版をビルド  
yarn start                  # プロダクションサーバーを起動
```

### コード品質
```bash
yarn lint                   # Biomeリンターを実行
yarn lint:fix               # リンティング問題を自動修正
yarn typeCheck              # TypeScript型チェックを実行
yarn test                   # Vitestでテストを実行
```

### データベースコマンド
```bash
yarn db:generate            # Prismaクライアントを生成
yarn db:push                # スキーマ変更をデータベースにプッシュ
yarn db:console             # Prisma Studioを開く
yarn db:seed                # テストデータでデータベースをシード
```

### テスト
```bash
yarn test                   # 全テストを実行
yarn test src/app/books/    # 特定のテストディレクトリを実行
```

## 開発ワークフロー

### コード変更後の必須チェック
コードを変更した後は、必ず以下の順序でコマンドを実行してください：

```bash
yarn typeCheck              # 型エラーのチェック
yarn lint:fix               # コードスタイルのチェックと自動修正
yarn test                   # テストの実行
```

すべてのチェックが成功することを確認してからコミットしてください。

## アーキテクチャ概要

社内図書館管理システム（Next.js 15製）の構成：

### コア技術
- **Next.js 15** App Router使用
- **Prisma** + PostgreSQL (Vercel Postgres)
- **NextAuth.js** 認証 (Azure AD/B2C)
- **Tailwind CSS** + **DaisyUI** スタイリング
- **TypeScript** 全体で使用
- **Vitest** テストフレームワーク

### 主要アーキテクチャパターン

#### 認証・認可
- NextAuth.jsミドルウェアでルート保護
- 認証設定は `src/app/api/auth/[...nextauth]/authOptions.ts`
- APIルート、静的ファイル、認証ページ以外は全て保護

#### データベース層
- Prisma ORM + PostgreSQL
- グローバルPrismaクライアント (`src/libs/prisma/client.ts`)
- モデル: User, Book, LendingHistory, ReturnHistory, RegistrationHistory, Impression, Reservation

#### Server Actionsパターン
- データ変更は `actions.ts` ファイルのServer Actions
- Server ActionsとAPIルートでPrisma直接使用
- カスタムErrorオブジェクトでエラーハンドリング

#### API統合
- Google Books API（書籍メタデータ取得）
- Slack webhook（通知機能、オプション）
- Vercel Blob（画像ストレージ）

### プロジェクト構造

```
src/
├── app/                    # Next.js App Routerページ
│   ├── api/               # APIルート
│   ├── books/             # 書籍管理ページ
│   ├── users/             # ユーザープロフィールページ
│   └── auth/              # 認証ページ
├── components/            # 再利用可能UIコンポーネント
├── hooks/                 # カスタムReactフック
├── libs/                  # 外部サービス統合
├── models/                # 型定義
├── services/              # ビジネスロジック（現在空）
└── utils/                 # ユーティリティ関数
```

### コードスタイル・規約
- Biome使用（リンティング・フォーマット）
- 2スペースインデント、100文字行幅
- JS/TSは単一引用符、JSXは二重引用符
- 末尾カンマ有効
- 日本語コメント・エラーメッセージ

### テスト設定
- Vitest + jsdom環境
- React Testing Libraryでコンポーネントテスト
- テスト用データベースはシングルトンPrismaクライアント
- テストファイルは `test/` ディレクトリでソース構造をミラー

### データベーススキーマの特徴
- データベースカラムは@mapディレクティブでsnake_case
- 貸出・返却履歴間のソフトリレーション
- 書籍予約とユーザー感想をサポート
- 完全な書籍ライフサイクル追跡（登録 → 貸出 → 返却）

### 外部依存関係
- 認証にAzure AD/B2C必須
- 通知用Slack統合（オプション）
- Vercelプラットフォームサービス使用（Postgres、Blobストレージ）
