# ドキュメント

このディレクトリには、ホームラボアプリケーションの設計、仕様、運用、未決事項を整理します。

## 構成

| ディレクトリ / ファイル | 内容 |
| --- | --- |
| `architecture/` | システム全体、環境、認証、DB、デプロイの設計 |
| `application/` | アプリケーション仕様、画面、API、ドメインモデル |
| `operations/` | 本番運用、Secret、バックアップ・復旧 |
| `decisions/` | 重要な設計判断の記録 |
| `roadmap.md` | 今後の実装予定 |
| `open-questions.md` | 未決事項、確認が必要な事項 |

## 読む順序

1. `architecture/overview.md`
2. `architecture/environments.md`
3. `architecture/authentication.md`
4. `operations/production.md`
5. `roadmap.md`
6. `open-questions.md`

## 運用ルール

- 決定済みの設計は `architecture/` または `operations/` に記載します。
- アプリの機能仕様は `application/` に記載します。
- まだ決まっていない内容は `TBD` として明示し、必要に応じて `open-questions.md` に集約します。
- 重要な判断をした場合は `decisions/` に ADR として残します。
