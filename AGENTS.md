# AGENTS.md

This file provides guidance to AI coding agents working with this repository.

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
yarn build                  # Prismaクライアント生成 + プロダクション版ビルド
yarn start                  # プロダクションサーバーを起動
```

### コード品質
```bash
yarn lint                   # Biomeリンターを実行（チェックのみ）
yarn lint:fix               # リンティング問題を自動修正
yarn lint:ci                # CI用リンター（GitHub形式レポート）
yarn typeCheck              # next typegen + TypeScript型チェックを実行
yarn test                   # Vitestでテストを実行
```

### データベースコマンド
```bash
yarn db:generate            # Prismaクライアントを生成（src/generated/prisma/ に出力）
yarn db:push                # .env.development.local を使ってスキーマをDBにプッシュ
yarn db:console             # Prisma Studioを開く
yarn db:seed                # テストデータでデータベースをシード
```

### ローカルDB（Docker）
```bash
docker compose up -d        # PostgreSQL 18コンテナを起動（ポート5432）
docker compose down         # コンテナを停止
```

### テスト
```bash
yarn test                   # 全テストを実行
yarn test src/app/books/    # 特定のテストディレクトリを実行
```

### E2Eテスト（Playwright）
閲覧系ユーザーフロー（ログイン→書籍一覧→検索→詳細→マイページ→利用者一覧）を実ブラウザで検証します。
事前にPostgreSQLの起動・スキーマ反映・シード投入・ビルドが必要です。

```bash
docker compose up -d                          # PostgreSQLを起動
# .env.development.local に NEXT_PUBLIC_DEFAULT_PROVIDER=credentials を設定（Mockログイン用）
yarn db:generate && yarn db:push && yarn db:seed
yarn build
npx playwright install chromium               # 初回のみブラウザを取得
yarn test:e2e                                 # E2Eテストを実行（webServerが yarn start を自動起動）
yarn test:e2e:ui                              # UIモードで実行（デバッグ用）
```

- テストは `e2e/` ディレクトリに配置（`*.spec.ts`）
- `e2e/auth.setup.ts` が開発用Mockログインでサインインし、セッションを `e2e/.auth/user.json` に保存
- アサーションは `prisma/seed.ts` のシードデータに依存
- CIでは `.github/workflows/e2eTest.yml` で自動実行（PostgreSQLサービス + seed + build + playwright）

## 開発ワークフロー

### コード変更後の必須チェック
コードを変更した後は、**必ず以下の順序**でコマンドを実行してください：

```bash
yarn typeCheck              # 型エラーのチェック（next typegenも実行される）
yarn lint:fix               # コードスタイルのチェックと自動修正
yarn test                   # テストの実行
```

すべてのチェックが成功することを確認してからコミットしてください。

### ローカル開発のセットアップ
1. `docker compose up -d` でPostgreSQLを起動
2. `.env.development.local` に環境変数を設定（`.env.example` を参照）
3. `yarn db:push` でスキーマをDBに反映
4. `yarn db:seed` でシードデータを投入（オプション）
5. `yarn dev` で開発サーバーを起動

## アーキテクチャ概要

社内図書館管理システム（Next.js 16製）の構成：

### コア技術
- **Next.js 16.1.6** App Router使用（`output: 'standalone'`、`typedRoutes: true`）
- **React** canary版（React 19対応、`useActionState` などの新機能を使用）
- **Prisma 6.x** + PostgreSQL（Vercel Postgres）、クライアントは `src/generated/prisma/` に生成
- **`@prisma/adapter-pg`** を使用した接続（コネクションプーリング対応）
- **NextAuth.js** 認証（Azure AD / Azure AD B2C の両方をサポート）
- **Tailwind CSS v4** + **DaisyUI v5** スタイリング
- **TypeScript** 全体で使用（strict モード）
- **Vitest v4** テストフレームワーク
- **Biome v2** リンター・フォーマッター
- **Zod v4** バリデーション（`import * as z from 'zod/v4'` の形式で使用）
- **SWR v2** クライアントサイドデータフェッチ
- **Luxon** 日時処理（JST表示対応）
- **mise** Node.jsバージョン管理（Node 24.16.0、Yarn 4.15.0）

### 主要アーキテクチャパターン

#### 認証・認可
- `src/proxy.ts` が NextAuth.js ミドルウェア（標準の `middleware.ts` の代わり）
- Azure AD と Azure AD B2C の両方のプロバイダーをサポート
- `NEXT_PUBLIC_DEFAULT_PROVIDER` 環境変数でデフォルトプロバイダーを設定（`'azure-ad'` または `'azure-ad-b2c'`）
- 認証設定は `src/app/api/auth/[...nextauth]/authOptions.ts`
- APIルート、静的ファイル、認証ページ以外は全て保護
- セッションにカスタムユーザー情報（`session.customUser`）とIDトークン（`session.idToken`）を追加
- 初回ログイン時にDBへ自動的にユーザーを作成

#### データベース層
- Prisma ORM + PostgreSQL
- グローバルPrismaクライアント `src/libs/prisma/client.ts`（開発環境ではグローバル変数でホットリロード対応）
- 本番環境では `POSTGRES_PRISMA_URL`（コネクションプーリング）、直接接続は `POSTGRES_URL_NON_POOLING`
- モデル型は `@/generated/prisma/models` から re-export して `src/models/` で使用
- モデル: `User`, `Book`, `LendingHistory`, `ReturnHistory`, `RegistrationHistory`, `Impression`, `Reservation`, `Location`

#### Server Actionsパターン
- データ変更は各ページディレクトリ内の `actions.ts` ファイルのServer Actions（ファイル先頭に `'use server'`）
- React 19の `useActionState` フックと組み合わせてフォーム状態管理に使用
- Zod でフォームバリデーション → 成功時に Prisma でDB操作 → `revalidatePath` でキャッシュ更新
- エラーは `Error` オブジェクトまたは `CustomError` 型（`src/models/errors.ts`）で管理
- DB操作は `.catch()` でエラーをキャッチし、Errorオブジェクトを返す（throw しない）
- 複数DB操作は `prisma.$transaction()` で一貫性を保証

#### APIルート
- `GET /api/books/search` - タイトル・説明のキーワード検索（ロケーション絞り込みも可能）
- `GET /api/books/searchByIsbn` - ISBN検索（既存書籍の確認用）
- `GET /api/locations` - ロケーション一覧取得
- `GET /api/cron/overdue` - 返却期限超過書籍のSlack通知（Vercel Cron Job）
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js ハンドラー
- APIルートのエラーは `CustomError` 型（`{ errorCode: string, message: string }`）でJSON返却

#### 外部API統合
- **Google Books API** - ISBN検索で書籍メタデータ取得（`GOOGLE_BOOK_SEARCH_QUERY` 定数）
- **OpenBD API** - ISBN検索で書籍メタデータ取得（`OPENBD_SEARCH_QUERY` 定数、日本語書籍向け）
- **Slack webhook** - 書籍登録通知・返却期限超過通知（`SLACK_WEBHOOK_URL`、オプション）
- **Vercel Blob** - 書籍カバー画像ストレージ（`cover/{isbn}.jpg` 形式で保存）
- **Gravatar** - ユーザーアバター画像取得

#### Vercel Cron Job
- `vercel.json` で設定: 毎週火曜日 23:00 UTC に `/api/cron/overdue` を実行
- `CRON_SECRET` 環境変数で認証（`Authorization: Bearer {secret}` ヘッダー）
- 返却期限超過書籍をSlack Block KitでSlackに通知

### プロジェクト構造

```
/
├── src/
│   ├── app/                        # Next.js App Routerページ
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/ # NextAuth.js ハンドラー・設定
│   │   │   ├── books/
│   │   │   │   ├── search/         # キーワード書籍検索API
│   │   │   │   └── searchByIsbn/   # ISBN書籍検索API
│   │   │   ├── cron/overdue/       # 返却期限超過通知Cron
│   │   │   └── locations/          # ロケーション一覧API
│   │   ├── auth/signIn/            # サインインページ
│   │   ├── books/
│   │   │   ├── [id]/               # 書籍詳細ページ（貸出・返却・感想）
│   │   │   └── register/           # 書籍登録ページ
│   │   ├── users/
│   │   │   └── [id]/               # ユーザープロフィールページ
│   │   ├── layout.tsx              # ルートレイアウト
│   │   ├── page.tsx                # トップページ（書籍一覧）
│   │   ├── bookList.tsx            # 書籍一覧コンポーネント
│   │   ├── navigationBar.tsx       # ナビゲーションバー
│   │   └── navigationBarItem.tsx   # ナビゲーションアイテム
│   ├── components/                 # 再利用可能UIコンポーネント
│   │   ├── common/
│   │   │   └── headline.tsx        # 見出しコンポーネント
│   │   ├── bookTile.tsx            # 書籍タイルカード
│   │   └── userAvatar.tsx          # ユーザーアバター
│   ├── constants.ts                # 定数（API URL、日付フォーマット等）
│   ├── generated/prisma/           # Prismaが自動生成（コミット不要）
│   ├── hooks/
│   │   ├── server/
│   │   │   └── readingHistories.ts # 読書履歴計算ロジック（サーバーサイド）
│   │   └── useCustomUser.ts        # 認証ユーザー取得カスタムフック（クライアント）
│   ├── libs/                       # 外部サービス統合
│   │   ├── gravatar/               # Gravatarアバター取得
│   │   ├── luxon/                  # 日時ユーティリティ（JST対応）
│   │   ├── next-auth/types/        # NextAuth.js 型定義拡張
│   │   ├── prisma/client.ts        # グローバルPrismaクライアント
│   │   ├── slack/webhook.ts        # Slack Webhook通知
│   │   ├── swr/fetcher.ts          # SWR用フェッチャー
│   │   └── vercel/                 # Vercel Blob画像アップロード（SSRF対策あり）
│   ├── models/                     # 型定義（Prismaモデルの re-export）
│   │   ├── book.ts
│   │   ├── errors.ts               # CustomError型・型ガード
│   │   ├── lendingHistory.ts
│   │   ├── location.ts
│   │   ├── returnHistory.ts
│   │   └── user.ts
│   ├── proxy.ts                    # NextAuth.js ミドルウェア（認証ガード）
│   └── utils/
│       └── stringUtils.ts          # 文字列ユーティリティ
├── test/
│   └── __utils__/                  # テスト共通ユーティリティ
│       ├── data/                   # テスト用データファクトリ（book, user, etc.）
│       └── libs/prisma/singleton.ts # Prismaモック（vitest-mock-extended使用）
├── prisma/
│   ├── schema.prisma               # DBスキーマ定義
│   └── seed.ts                     # シードデータ（yarn db:seed で実行）
├── docker-compose.yml              # ローカル開発用PostgreSQL 18
├── vitest.config.ts                # Vitestの設定
├── vitest.setup.ts                 # テストセットアップ（jest-dom + 環境変数スタブ）
├── biome.json                      # Biomeリンター・フォーマッター設定
├── next.config.mjs                 # Next.js設定
├── vercel.json                     # Vercel Cron Jobs設定
├── renovate.json                   # Renovate依存関係自動更新設定
└── tsconfig.json                   # TypeScript設定（@/* → src/* パスエイリアス）
```

### コードスタイル・規約（Biome設定より）
- **インデント**: スペース2つ
- **行幅**: 100文字
- **引用符**: JS/TSは単一引用符、JSXは二重引用符
- **末尾カンマ**: 有効（`"all"`）
- **セミコロン**: 不要時は省略（`"asNeeded"`）
- **Import整理**: 自動（Biome assist）
- 日本語コメント・エラーメッセージを使用
- `src/generated/prisma/` はBiomeのチェック対象外

### テスト設定
- **フレームワーク**: Vitest v4 + jsdom環境
- **コンポーネントテスト**: React Testing Library
- **テストファイルの配置**: ソースファイルと同じディレクトリに `.test.ts` / `.test.tsx` ファイルを配置（co-located）
- **テスト共通ユーティリティ**: `test/__utils__/` ディレクトリ
  - `test/__utils__/libs/prisma/singleton.ts` - Prismaクライアントのモック（`vitest-mock-extended`）
  - `test/__utils__/data/` - テスト用データファクトリ（book, user, lendingHistory, location, randomToken）
- **Setup**: `vitest.setup.ts` でjest-domマッチャーを登録し、Azure AD B2C環境変数をスタブ化
- **パスエイリアス**: `@/*` で `src/*` を参照（`vite-tsconfig-paths`）

### データベーススキーマの詳細
- データベースカラムは `@map` ディレクティブでsnake_case（例: `bookId` → `book_id`）
- テーブル名は `@@map` でsnake_case（例: `LendingHistory` → `lending_histories`）
- **モデル一覧**:
  - `User` - ユーザー（email unique、Azure ADから自動作成）
  - `Book` - 書籍（isbn unique）
  - `LendingHistory` - 貸出履歴（返却日なし = 貸出中）
  - `ReturnHistory` - 返却履歴（`lendingHistoryId` unique でLendingHistoryと1:1）
  - `RegistrationHistory` - 登録履歴（書籍がいつ・誰によって・どこに登録されたか）
  - `Impression` - 感想（返却時または後から追加可能）
  - `Reservation` - 予約（`reservationDate` は `@db.Date` 型）
  - `Location` - 保管場所（書籍の保管棚・部屋など）
- **書籍ライフサイクル**: 登録（RegistrationHistory作成）→ 貸出（LendingHistory作成）→ 返却（ReturnHistory作成）

### 環境変数（`.env.example` 参照）
```bash
# NextAuth
NEXTAUTH_SECRET=               # openssl rand -base64 32 で生成
NEXTAUTH_URL=                  # 例: http://localhost:3000
NEXT_PUBLIC_DEFAULT_PROVIDER=  # 'azure-ad' または 'azure-ad-b2c'

# Azure AD
AZURE_AD_TENANT_ID=
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=

# Azure AD B2C
AZURE_AD_B2C_TENANT_NAME=
AZURE_AD_B2C_CLIENT_ID=
AZURE_AD_B2C_CLIENT_SECRET=
AZURE_AD_B2C_PRIMARY_USER_FLOW=

# Slack（オプション）
SLACK_WEBHOOK_URL=

# Vercel Storage
POSTGRES_PRISMA_URL=           # コネクションプーリングURL
POSTGRES_URL_NON_POOLING=      # 直接接続URL（マイグレーション用）
BLOB_READ_WRITE_TOKEN=

# Vercel Cron Jobs
CRON_SECRET=                   # /api/cron/overdue の認証シークレット
```

### CI/CD（GitHub Actions）

Pull Request 時に自動で以下のチェックが実行されます：

| ワークフロー | 内容 |
|---|---|
| `unitTest.yml` | `yarn test`（Vitest） |
| `buildCheck.yml` | `yarn db:generate && yarn build` |
| `typeCheck.yml` | `yarn db:generate && yarn typeCheck` |
| `reviewdogBiome.yml` | `yarn lint:ci`（Biome CI モード） |
| `codeql.yml` | CodeQL セキュリティスキャン |
| `dependency-review.yml` | 依存関係の脆弱性チェック |

**Node.js / Yarn のバージョンは mise で自動管理**（`mise.toml` でNode.jsおよびYarnのバージョンを固定）

### 外部依存関係
- **認証**: Azure AD または Azure AD B2C が必須
- **通知**: Slack Webhook（オプション、未設定でも動作する）
- **ストレージ**: Vercel Blob（書籍カバー画像）
- **DB**: Vercel Postgres（`POSTGRES_PRISMA_URL`）またはローカルDocker PostgreSQL
- **デプロイ**: Vercelプラットフォーム（standalone出力）
