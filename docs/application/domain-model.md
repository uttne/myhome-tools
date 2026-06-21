# ドメインモデル

アプリケーションエンティティの索引です。属性の詳細は `features/` を参照してください。

SQLModel 定義: `backend/app/models.py`（フェーズ 1 で拡張予定）  
DB 設計: `../architecture/database.md`

## エンティティ一覧

| エンティティ | テーブル | 機能 | 仕様 | 状態 |
| --- | --- | --- | --- | --- |
| User | `users` | 認証 | [`features/auth.md`](features/auth.md) | 実装済み |
| Group | `groups` | グループ | [`features/groups.md`](features/groups.md) | 未着手 |
| GroupMembership | `group_memberships` | グループ | 同上 | 未着手 |
| ShoppingList | `shopping_lists` | 買い物リスト | [`features/shopping-list.md`](features/shopping-list.md) | 未着手 |
| ShoppingListItem | `shopping_list_items` | 買い物リスト | 同上 | 未着手 |
| ShoppingItemMaster | `shopping_item_masters` | 買い物リスト | 同上 | 未着手 |
| StoredObject | `stored_objects` | ファイルストレージ | [`../architecture/object-storage.md`](../architecture/object-storage.md) | 未着手 |

## 関係図（フェーズ 1）

```text
User
  └── group_memberships (N:M) ──► Group
                                    ├── shopping_lists (1:N)
                                    │     └── shopping_list_items (1:N)
                                    │           └── shopping_item_masters (N:1, optional)
                                    └── shopping_item_masters (1:N)
                                          └── stored_objects (N:1, optional)
```

## ドメインルール

### グループ

| ルール | 説明 |
| --- | --- |
| 個人グループ | ユーザー作成時に1つ自動作成 |
| データスコープ | 買い物リスト・マスターは `group_id` に紐づく |
| アクセス | グループメンバーのみ当該データを操作可能 |

### 買い物リスト

| ルール | 説明 |
| --- | --- |
| 複数リスト | グループ内で複数の `active` リストを保持 |
| デフォルトリスト | `is_default = true` はグループ内で同時に1件（active 時） |
| ライフサイクル | `active` → `archived` → 完全削除。完了状態は持たない |
| 表示順 | GET の `sort` クエリ。永続化しない（フェーズ1） |
| 画像 | マスターのみ。`GET /api/v1/files/{id}` で配信 |

## User（概要）

認証・認可の中心エンティティ。詳細: [`features/auth.md`](features/auth.md)

## 新エンティティ追加時

1. `features/<機能>.md` にデータモデルを記載
2. 本ファイルの一覧表を更新
3. `../architecture/database.md` にスキーマを追記
