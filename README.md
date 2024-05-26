# Company-Library

Company Libraryは、社内の書籍を管理するためのアプリケーションです。  
Vercel上にデプロイすることで、どこの会社でも簡単に導入できます。

トップ画面
![top](https://github.com/company-library/company-library/assets/10972787/eb0a9379-a1d6-4b27-8aa8-a85b217645bc)

書籍の詳細画面
![detail](https://github.com/company-library/company-library/assets/10972787/eceb4b5b-548c-431a-b934-6e63a9bd5d1d)

ユーザーの読書履歴画面
![user-page](https://github.com/company-library/company-library/assets/10972787/6e3ce2cb-212c-46ae-9b67-9b334b91edf2)

## Features

- 書籍の登録
- 書籍の検索
- 書籍の詳細表示
- 書籍の貸出と返却
- 書籍に関する感想の登録
- ユーザーの読書履歴の閲覧

## Architecture

```mermaid
graph TB;
    Client[クライアント] -->|HTTPリクエスト| Vercel["Next.jsアプリケーション<br>(Vercel)"];
    Vercel -->|認証要求| Auth["認証<br>(Azure AD  or<br>Azure AD B2C)"];
    Vercel -->|データベースクエリ| DB["データベース<br>(Vercel Postgresql)"];
    Vercel -->|ファイルアクセス| Blob["ファイルストレージ<br>(Vercel Blob)"];
    Vercel -->|通知| Slack["Slack"];
    Auth -->|認証応答| Vercel;
    DB -->|データ応答| Vercel;
    Blob -->|ファイル応答| Vercel;

    style Client fill:#f0f0f0,stroke:#000,stroke-width:1px,color:#000
    style Vercel fill:#f0f0f0,stroke:#000,stroke-width:3px,color:#000
    style Auth fill:#f0f0f0,stroke:#000,stroke-width:3px,color:#000
    style DB fill:#f0f0f0,stroke:#000,stroke-width:3px,color:#000
    style Blob fill:#f0f0f0,stroke:#000,stroke-width:3px,color:#000
    style Slack fill:#f0f0f0,stroke:#000,stroke-width:3px,color:#000
```

認証基盤は他の認証基盤のニーズがあれば追加します。  
要望があれば、Issueを立ててください。

## Deploy your own

- Vercel
- Vercel Postgres
- Vercel Blob
- Azure AD or Azure AD B2C
- Slack

を使用します。

### 1. 認証基盤の設定

Azure ADまたはAzure AD B2Cを使用して認証を行います。

以下のどちらかを見て、設定を行ってください。

- [Azure ADの設定手順](https://next-auth.js.org/providers/azure-ad)
- [Azure AD B2Cの設定手順](https://next-auth.js.org/providers/azure-ad-b2c)

環境変数についてはVercelのプロジェクト作成時に設定するので手元に控えていてください。
必要な環境変数については、`.env.example`を参照してください。

### 2. Vercelへのデプロイ
Deploy the example using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcompany-library%2Fcompany-library&stores%3D%5B%7B%22type%22%3A%22postgres%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D)

## Run local

### Run local DB

```bash
docker-compose --env-file .env.local up -d  
```

### Migrate DB

```bash
yarn db:generate
yarn db:push
```

### Run on local

```bash
yarn dev
```
