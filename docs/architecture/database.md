# データベース設計

## 方針

本番環境では、既存 PostgreSQL 上に本アプリ専用の DB を作成し、アプリケーションデータを格納します。

開発環境では Docker Compose 上の PostgreSQL を利用します。

## ORM / マイグレーション

| 用途 | 採用技術 |
| --- | --- |
| ORM | SQLModel |
| マイグレーション | Alembic |

SQLModel で定義したモデルを元に、Alembic でスキーマ変更を DB へ適用します。

## users テーブル

Cloudflare Access 経由で作成されるユーザーはローカルパスワードを持たないため、`password_hash` は `NULL` を許容します。

想定カラム:

| カラム | 概要 |
| --- | --- |
| `id` | 内部ユーザー ID |
| `email` | ログイン識別子。ユニーク制約を付与 |
| `password_hash` | ローカル認証用。Cloudflare 専用ユーザーでは `NULL` |
| `display_name` | 表示名 |
| `role` | 権限ロール |
| `auth_provider` | 初回作成時の認証元。例: `cloudflare`, `local` |
| `is_active` | ログイン許可状態 |
| `created_at` | 作成日時 |
| `updated_at` | 更新日時 |

LAN 内アクセス用に、Cloudflare Access 経由で作成されたユーザーが後からローカルパスワードを設定できるエンドポイントを用意します。

## 今後追加する設計

TBD:

- 具体的な SQLModel モデル定義
- インデックス方針
- 外部キー制約
- 論理削除の有無
- 監査ログテーブルの要否
