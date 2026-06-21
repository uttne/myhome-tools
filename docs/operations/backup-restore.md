# バックアップ・復旧

## 方針

**バックアップ・復旧の運用は本アプリリポジトリの責務ではありません。** 家庭 k3s 管理リポジトリおよび既存 PostgreSQL の運用で扱います。

本リポジトリでは、復旧後にアプリ側で確認すべき項目のみを記載します。

| 対象 | 運用責務 |
| --- | --- |
| PostgreSQL（`myhome_tools` DB 含む） | k3s 管理リポジトリ / 既存 DB 運用 |
| JuiceFS / ファイルストレージ（本番） | k3s 管理リポジトリ |
| 開発用ローカルファイル（`data/files`） | 開発者（手動） |

## 環境別 DB 名

| 環境 | DB 名 | 備考 |
| --- | --- | --- |
| 開発（Compose / ローカル） | `myhome_tools` | `docker-compose.yml` で定義 |
| 本番 | `myhome_tools` | 既存 PostgreSQL 上の専用 DB |

## 復旧後にアプリ側で確認する項目

復旧手順自体は k3s 管理リポジトリに従います。復旧後、このアプリでは次を確認します。

- FastAPI が DB に接続できること（`/readyz` が成功）
- `/api/v1/me` が認証状態に応じて期待通り応答すること
- Alembic の `alembic_version` が復元され、アプリのイメージ tag とスキーマが一致すること
- 主要データ（ユーザー、買い物リスト等）が参照できること
- 画像参照（`GET /api/v1/files/{id}`）が必要な場合、ファイルストレージも復旧済みであること

## 現在の Alembic revision

| revision | 内容 |
| --- | --- |
| `0001_create_users` | `users` テーブル作成 |

復旧時に参照する情報:

- 専用 DB 名: `myhome_tools`
- 本番アプリのイメージ tag（frontend / backend）
- 適用済み Alembic revision

## 関連

- 本番運用: [`production.md`](production.md)
- ファイルストレージ: [`../architecture/object-storage.md`](../architecture/object-storage.md)
