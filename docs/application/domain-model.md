# ドメインモデル

アプリケーションエンティティの索引です。属性の詳細は `features/` を参照してください。

SQLModel 定義: `backend/app/models.py`  
DB 設計: `../architecture/database.md`

## エンティティ一覧

| エンティティ | テーブル | 機能 | 仕様 | 状態 |
| --- | --- | --- | --- | --- |
| User | `users` | 認証 | [`features/auth.md`](features/auth.md) | 実装済み |
| （業務） | TBD | TBD | TBD | 未実装 |

## 関係図（現在）

```text
User
  └── （将来）業務エンティティへの参照
```

## User（概要）

認証・認可の中心エンティティ。主要属性:

| 属性 | 概要 |
| --- | --- |
| `id` | UUID |
| `email` | ユニーク、小文字正規化 |
| `password_hash` | bcrypt。Cloudflare ユーザーは NULL |
| `role` | `admin` / `user` |
| `auth_provider` | `cloudflare` / `local` |
| `is_active` | ログイン許可 |

属性・不変条件・状態遷移の詳細: [`features/auth.md#データモデル`](features/auth.md)

## 新エンティティ追加時

1. `features/<機能>.md` にデータモデルを記載
2. 本ファイルの一覧表を更新
3. `../architecture/database.md` にスキーマを追記
