# データベース設計

## 方針

本番環境では、既存 PostgreSQL 上に本アプリ専用の DB を作成し、アプリケーションデータを格納します。

開発環境では Docker Compose 上の PostgreSQL 17 を利用します。

| 環境 | DB 名 | 接続先 |
| --- | --- | --- |
| 開発（Compose） | `myhome_tools` | `postgresql+psycopg://myhome:myhome@db:5432/myhome_tools` |
| 開発（ローカル直接起動） | `myhome_tools` | `postgresql+psycopg://myhome:myhome@localhost:5432/myhome_tools` |
| 本番 | TBD | Kubernetes Secret の `DATABASE_URL` |

## ORM / マイグレーション

| 用途 | 採用技術 |
| --- | --- |
| ORM | SQLModel |
| マイグレーション | Alembic |
| DB ドライバ | psycopg 3 |

SQLModel で定義したモデルを元に、Alembic でスキーマ変更を DB へ適用します。

マイグレーション適用:

```bash
task db:migrate
```

## 現在のスキーマ

### users

Cloudflare Access 経由で作成されるユーザーはローカルパスワードを持たないため、`password_hash` は `NULL` を許容します。

| カラム | 型 | 制約 | 概要 |
| --- | --- | --- | --- |
| `id` | UUID | PK | 内部ユーザー ID |
| `email` | VARCHAR | UNIQUE, INDEX | ログイン識別子。保存時に小文字へ正規化 |
| `password_hash` | VARCHAR | NULL 可 | ローカル認証用 bcrypt ハッシュ |
| `display_name` | VARCHAR | NULL 可 | 表示名 |
| `role` | VARCHAR | NOT NULL | `admin` または `user` |
| `auth_provider` | VARCHAR | NOT NULL | `cloudflare` または `local` |
| `is_active` | BOOLEAN | NOT NULL, default true | ログイン許可状態 |
| `created_at` | TIMESTAMPTZ | NOT NULL | 作成日時（UTC） |
| `updated_at` | TIMESTAMPTZ | NOT NULL | 更新日時（UTC） |

SQLModel 定義: `backend/app/models.py`

Alembic revision: `0001_create_users`

### 列挙型

| 名前 | 値 | 用途 |
| --- | --- | --- |
| `UserRole` | `admin`, `user` | アプリ内認可 |
| `AuthProvider` | `cloudflare`, `local` | 初回作成時の認証元 |

## 今後追加する設計

TBD:

- 業務機能に必要なテーブル
- インデックス方針
- 外部キー制約
- 論理削除の有無
- 監査ログテーブルの要否
