# ドキュメント

このディレクトリには、ホームラボアプリケーションの設計、仕様、運用、未決事項を整理します。

## 構成

| ディレクトリ / ファイル | 内容 |
| --- | --- |
| `architecture/` | システム全体、環境、認証、DB、デプロイ、ファイルストレージ |
| `application/` | アプリケーション設計、機能仕様、索引 |
| `application/features/` | 機能別仕様（本体） |
| `operations/` | 本番運用、Secret、バックアップ・復旧 |
| `decisions/` | 重要な設計判断の記録（ADR） |
| `roadmap.md` | 実装予定と完了状況 |
| `open-questions.md` | 未決事項、確認が必要な事項 |

## 読む順序

### 初めて読む場合

1. `architecture/overview.md` — システム全体像
2. `application/design.md` — アプリケーション設計（家族 Hub）
3. `application/features/groups.md` — グループモデル
4. `application/features/shopping-list.md` — 買い物リスト仕様
5. `architecture/object-storage.md` — ファイルストレージ（`FILE_STORAGE_ROOT`）
6. `architecture/environments.md` — 開発・本番環境
7. `architecture/authentication.md` — 認証・認可
8. `roadmap.md` — 実装状況と次のステップ
9. `open-questions.md` — 未決事項

### 実装時

| 作業 | 参照ドキュメント |
| --- | --- |
| 機能追加 | `application/features/_template.md`, `application/design.md` |
| API 追加 | `application/features/<機能>.md`, `application/api.md` |
| 画面追加 | `application/features/<機能>.md`, `application/screens.md` |
| UI コンポーネント確認 | `architecture/environments.md`（Storybook） |
| DB 変更 | `architecture/database.md`, `application/features/<機能>.md`, `application/domain-model.md` |
| 本番デプロイ | `architecture/deployment.md`, `operations/secrets.md` |
| 認証変更 | `application/features/auth.md`, `architecture/authentication.md` |

## 現在の実装状態

フェーズ 1（家族 Hub + 買い物リスト）の設計は完了。実装は未着手です。

| 領域 | 状態 |
| --- | --- |
| 認証 API / 最小 UI | 完了 |
| グループ / AppShell / Home / 買い物リスト | 設計済み・未実装 |
| ファイルストレージ連携 | 設計済み・未実装 |
| 本番デプロイ（Tunnel、ESO） | 未着手 |

## 運用ルール

- 決定済みの設計は `architecture/` または `operations/` に記載します。
- アプリの機能仕様は `application/features/` に記載します。全体設計は `application/design.md` を起点にします。
- まだ決まっていない内容は `TBD` として明示し、必要に応じて `open-questions.md` に集約します。
- 重要な判断をした場合は `decisions/` に ADR として残します。
- コードとドキュメントに差異がある場合は、コードを正としてドキュメントを更新します。
