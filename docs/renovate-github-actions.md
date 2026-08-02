# Renovate（GitHub Actionsセルフホスト版）のセットアップ

このリポジトリの依存関係更新は、[renovatebot/github-action](https://github.com/renovatebot/github-action) を使い
GitHub Actions（`.github/workflows/renovate.yml`）上でセルフホストして実行する。

参考: [Renovateをメモリ不足なクラウド版から、GitHub ActionsのSelf-host版へ移行した - newmo 技術ブログ](https://tech.newmo.me/entry/self-host-renovate-on-github-actions)

## 構成

- `.github/workflows/renovate.yml` - Renovateを実行するワークフロー（毎日 UTC 22:00 / JST 07:00 に実行 + `workflow_dispatch` で手動実行可）
- `renovate.json`（リポジトリルート） - Actionのグローバル設定（`platform`, `onboarding`, `requireConfig`）とリポジトリ固有の更新ルール（グルーピング、`schedule`（毎週土曜9時前）など）を1つのファイルにまとめて管理する。新規に別ファイルは作らず、既存のこのファイルをそのまま `configurationFile` として使う

`GITHUB_TOKEN` はActionsが作成したPull Requestに対してCIワークフローをトリガーできないという制約があるため、
認証には GitHub App のトークンを使用する（[`actions/create-github-app-token`](https://github.com/actions/create-github-app-token)）。

なお、`.github/workflows/renovate.yml` 内で参照するサードパーティActionはすべてタグではなくコミットハッシュで固定している（タグの差し替えによるサプライチェーン攻撃対策）。

## 事前準備（手動作業・コード変更では実施できないもの）

1. **GitHub Appの作成**
   - リポジトリ or Organization設定から新規GitHub Appを作成する
   - 権限: `Contents: Read and write`, `Pull requests: Read and write`, `Workflows: Read and write`（GitHub Actionsのバージョンも更新対象にする場合）
   - 対象リポジトリにインストールする
2. **Secretsの登録**（リポジトリの Settings > Secrets and variables > Actions）
   - `RENOVATE_APP_ID` - 作成したGitHub AppのApp ID
   - `RENOVATE_APP_PRIVATE_KEY` - 作成したGitHub Appのprivate key（PEM形式）
3. **既存のRenovate GitHub App（Mend/Renovateのクラウド版）との重複実行防止**
   - クラウド版Renovate Appをこのリポジトリからアンインストールする（Organization設定側の作業のため、このPRには含まれない）

## 動作確認

`workflow_dispatch` から手動実行し、Renovateのログでリポジトリが正しく検出され、PRが作成/更新されることを確認する。
