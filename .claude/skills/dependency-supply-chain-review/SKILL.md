---
name: dependency-supply-chain-review
description: >
  Renovate/Dependabotなどによる依存関係更新PRに対して、変更内容のサマリとサプライチェーンリスク評価を行い、
  PRにコメントとして投稿するスキル。
  以下の場合に使用する：
  (1) 依存関係更新PRの内容説明・レビューを依頼された時
  (2) 「更新内容をサマリして」「サプライチェーンリスクを評価して」と言われた時
  (3) Renovate/Dependabot作成のPRを確認・監視している時
---

# Dependency Supply Chain Review

Renovate/DependabotなどのボットPRについて、更新内容の要約と、悪意あるメンテナー乗っ取り・typosquat・不審なinstallスクリプト等のサプライチェーンリスクを評価し、PRにコメントとして投稿する。

## ワークフロー

### 1. 対象PRの特定

```bash
gh pr view --json number,title,body -q '.'
```

Renovate/Dependabotが作成したPRであることを確認する（`renovate/`や`dependabot/`ブランチ、bot作成者）。

### 2. 更新内容の把握

- PR本文（Renovateの場合、更新パッケージ一覧テーブルとリリースノートのdetails）を取得する
- PR本文がGitHub側の文字数制限で途中から切れている場合（"This PR body was truncated"）、各パッケージの公式リリースノート（GitHub Releases等）をWebFetchで直接取得して補完する
- 直近のコミットで`package.json`・`yarn.lock`（または`package-lock.json`）の実差分を確認する

```bash
git show <commit> -- package.json yarn.lock
```

### 3. 変更内容のサマリ

パッケージごとに「何が変わったか」（新機能・バグ修正・パフォーマンス改善など）を日本語で要約する。バージョン番号の羅列だけでなく、changelogの内容を反映すること。

### 4. サプライチェーンリスク評価

`yarn.lock`の全差分から、直接依存だけでなく**推移的依存関係の変更**も洗い出す。

```bash
git show <commit> -- yarn.lock | grep -E '^\+' | grep -oP '(?<=^\+  resolution: ")[^"]+' | sort -u
```

変更・追加された各パッケージについて、npmレジストリのメタデータを確認する：

```bash
npm view <package>@<version> time.modified maintainers scripts.postinstall scripts.install scripts.preinstall
```

確認する観点：

- **メンテナーの整合性**: 公開者が当該パッケージの既存メンテナーと一致しているか（不審な新規アカウントの追加がないか）
- **公開日時の妥当性**: changelogの日付やPR作成日と整合しているか（不自然な即席リリースでないか）
- **installライフサイクルスクリプトの有無**: `postinstall`/`preinstall`/`install`スクリプトが新規に追加されていないか（あれば内容を精査）
- **typosquat/パッケージ名乗っ取りの兆候**: 見慣れないパッケージ名が紛れ込んでいないか
- **既知のサプライチェーン侵害事例との照合**: 過去に侵害されたパッケージ群（例: 2025年9月のnpmワーム型攻撃で侵害されたchalk, debug, ansi-styles, color-convert等）と一致・関連していないか
- **GitHub Actionsの更新の場合**: タグではなくフルコミットSHAで固定されているか（タグ書き換え攻撃対策）

### 5. CI結果の確認

`yarnAudit`（既知脆弱性）、`dependency-review`（新規依存の脆弱性・ライセンス審査）、`CodeQL`等の結果を確認し、評価に含める。これらは既知のCVEベースの検知であり、ゼロデイの悪意あるコード混入までは検知できない点に留意する。

### 6. PRへの投稿

サマリとリスク評価をまとめて日本語でPRにコメント投稿する。

```bash
gh pr comment <pr_number> --body "..."
```

- 総合評価（低・中・高リスク）を明記する
- 破壊的変更や動作への影響がありそうな更新は個別に言及する
- リスクが疑われる場合は、マージを保留し人間のレビューを求める旨を明記する

## 注意事項

- npmレジストリへの問い合わせはネットワークアクセスを要するため、プロキシ制限がある環境では失敗する可能性がある
- CIがグリーンであることは「既知の脆弱性がない」ことの裏付けにしかならず、サプライチェーンリスク評価の代替にはならない
- 評価結果はあくまで参考情報であり、最終的なマージ判断は人間のレビューアーが行う
