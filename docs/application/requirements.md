# アプリケーション要件

横断的な要件を整理します。機能ごとの要件 ID は `features/` に記載します。

全体設計: [`design.md`](design.md)

## 想定利用者

| 利用者 | 説明 |
| --- | --- |
| 管理者 | 初期設定、ユーザー管理、全機能 |
| 家族ユーザー | 通常機能 |

## 機能要件（索引）

| 機能 | 要件 ID | 仕様 |
| --- | --- | --- |
| 認証・セッション | FR-AUTH-*, FR-ADMIN-* | [`features/auth.md`](features/auth.md) |
| 業務 | TBD | TBD |

## 非機能要件

| ID | カテゴリ | 要件 |
| --- | --- | --- |
| NFR-001 | セキュリティ | 外部公開は Cloudflare Access 経由。API 直アクセス経路を作らない |
| NFR-002 | セキュリティ | JWT 署名鍵、DB 接続情報は Secret 管理 |
| NFR-003 | 可用性 | 単一 replica から開始。LAN はローカル認証で利用可能 |
| NFR-004 | 保守性 | Alembic マイグレーション、Helm Chart によるデプロイ |
| NFR-005 | バックアップ | 既存 PostgreSQL バックアップに専用 DB を含める |
| NFR-006 | 開発 | Docker Compose を標準開発環境とする |

## スコープ外

- マルチテナント提供
- 公開 SaaS 運用
- PostgreSQL インスタンス自体の運用
- k3s クラスター管理

## 関連ドキュメント

| ドキュメント | 内容 |
| --- | --- |
| [`features/`](features/) | 機能別要件・仕様 |
| [`design.md`](design.md) | 全体設計 |
| [`api.md`](api.md) | API 索引 |
| [`screens.md`](screens.md) | 画面索引 |
| [`domain-model.md`](domain-model.md) | ドメイン索引 |
