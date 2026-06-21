# ドメインモデル

アプリケーションエンティティの索引です。属性の詳細は `features/` を参照してください。

SQLModel 定義: `backend/app/models.py`（フェーズ 1 で拡張予定）  
DB 設計: `../architecture/database.md`

## エンティティ一覧

| エンティティ | テーブル | 機能 | 仕様 | 状態 |
| --- | --- | --- | --- | --- |
| User | `users` | 認証 | [`features/auth.md`](features/auth.md) | 実装済み |
| ShoppingList | `shopping_lists` | 買い物リスト | [`features/shopping-list.md`](features/shopping-list.md) | 未着手 |
| ShoppingListItem | `shopping_list_items` | 買い物リスト | 同上 | 未着手 |
| ShoppingItemMaster | `shopping_item_masters` | 買い物リスト | 同上 | 未着手 |
| ShoppingListHistory | `shopping_list_history` | 買い物リスト | 同上 | 未着手 |
| StoredObject | `stored_objects` | ファイルストレージ | [`../architecture/object-storage.md`](../architecture/object-storage.md) | 未着手 |

## 関係図（フェーズ 1）

```text
User
  ├── shopping_lists (1:N)
  │     └── shopping_list_items (1:N)
  │           └── shopping_item_masters (N:1, optional)
  ├── shopping_item_masters (1:N)
  │     └── stored_objects (N:1, optional)
  └── shopping_list_history (1:N)
```

## ドメインルール（買い物リスト）

| ルール | 説明 |
| --- | --- |
| 家族共有 | 全 `user` / `admin` が同一データを参照・更新 |
| 複数リスト | 家族内で複数の `active` リストを保持可能 |
| デフォルトリスト | `is_default = true` は同時に1件。未指定追加はここへ |
| 履歴 | リスト完了時に `shopping_list_history` へスナップショット保存 |
| 画像 | マスターのみ。`stored_objects` 経由で `FILE_STORAGE_ROOT` 上のパスを参照 |

## User（概要）

認証・認可の中心エンティティ。詳細: [`features/auth.md`](features/auth.md)

## 新エンティティ追加時

1. `features/<機能>.md` にデータモデルを記載
2. 本ファイルの一覧表を更新
3. `../architecture/database.md` にスキーマを追記
