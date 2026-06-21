# ドキュメント

このディレクトリには、ホームラボアプリケーションの設計、仕様、運用、未決事項を整理します。

## 構成

| ディレクトリ / ファイル | 内容 |
| --- | --- |
| `architecture/` | システム全体、環境、認証、DB、デプロイの設計 |
| `application/` | アプリケーション設計、要件、画面、API、ドメインモデル |
| `operations/` | 本番運用、Secret、バックアップ・復旧 |
| `decisions/` | 重要な設計判断の記録（ADR） |
| `roadmap.md` | 実装予定と完了状況 |
| `open-questions.md` | 未決事項、確認が必要な事項 |

## 読む順序

### 初めて読む場合

1. `architecture/overview.md` — システム全体像
2. `application/design.md` — アプリケーション設計
3. `architecture/environments.md` — 開発・本番環境
4. `architecture/authentication.md` — 認証・認可
5. `roadmap.md` — 実装状況と次のステップ
6. `open-questions.md` — 未決事項

### 実装時

| 作業 | 参照ドキュメント |
| --- | --- |
| API 追加 | `application/api.md`, `application/domain-model.md` |
| 画面追加 | `application/screens.md`, `application/design.md` |
| DB 変更 | `architecture/database.md`, `application/domain-model.md` |
| 本番デプロイ | `architecture/deployment.md`, `operations/secrets.md` |
| 認証変更 | `architecture/authentication.md`, `decisions/ADR-0001-*.md` |

## 現在の実装状態

フェーズ 0（認証基盤）は完了しています。業務機能はフェーズ 1 以降で追加します。

| 領域 | 状態 |
| --- | --- |
| 認証 API / 最小 UI | 完了 |
| Docker Compose 開発環境 | 完了 |
| Helm Chart / 本番イメージ | 完了 |
| 業務機能 | 未着手 |
| 本番デプロイ（Tunnel、ESO） | 未着手 |

## 運用ルール

- 決定済みの設計は `architecture/` または `operations/` に記載します。
- アプリの機能仕様は `application/` に記載します。全体設計は `application/design.md` を起点にします。
- まだ決まっていない内容は `TBD` として明示し、必要に応じて `open-questions.md` に集約します。
- 重要な判断をした場合は `decisions/` に ADR として残します。
- コードとドキュメントに差異がある場合は、コードを正としてドキュメントを更新します。
