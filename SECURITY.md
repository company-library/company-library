# セキュリティポリシー

## サポートされているバージョン

本プロジェクトは最新の `main` ブランチのみセキュリティアップデートの対象です。

## 脆弱性の報告

**セキュリティ上の問題は公開 Issue に投稿しないでください。**

脆弱性を発見した場合は、GitHub の [Security Advisories](../../security/advisories/new) からプライベートに報告してください。

報告内容には以下を含めてください：

- 脆弱性の種類（例: XSS, SQLインジェクション, 認証バイパス）
- 影響を受けるファイル・コンポーネントのパス
- 再現手順
- 概念実証コード（可能であれば）
- 影響の説明

報告を受けてから **7 営業日以内** に初回返答を行います。

## サプライチェーンセキュリティ

本プロジェクトでは以下の対策を実施しています：

| 対策 | 実装方法 |
|------|----------|
| 依存関係ロック | `yarn.lock` + `yarn install --immutable` |
| 脆弱性スキャン（PR時） | GitHub Dependency Review (`fail-on-severity: moderate`) |
| 脆弱性スキャン（定期） | `yarn npm audit`（毎週月曜）|
| 自動セキュリティ更新 | Renovate (`osvVulnerabilityAlerts: true`) |
| 新規パッケージのクールダウン | Renovate (`minimumReleaseAge: "3 days"`) |
| コード静的解析 | CodeQL (`security-extended` クエリ) |
| GitHub Actions 固定 | 全 Action を SHA ハッシュでピン留め |
| ランタイム固定 | Volta（Node.js・Yarn バージョン固定）|
