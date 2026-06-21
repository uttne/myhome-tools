# 買い物リスト

| 項目 | 内容 |
| --- | --- |
| 機能 ID | shopping |
| 状態 | 未着手 |
| フェーズ | 1 |

## 概要

家族で共有する買い物リスト管理サービスです。

複数のリストを作成でき、デフォルトリストを指定します。リスト指定なしでアイテムを追加した場合はデフォルトリストに追加されます。

商品マスターに画像を登録でき、画像は `FILE_STORAGE_ROOT` 配下に保存します（本番は JuiceFS PVC）。

ストレージ設計: [`../../architecture/object-storage.md`](../../architecture/object-storage.md)

## コンセプト

| 概念 | 説明 |
| --- | --- |
| リスト | 買い物の単位（例: スーパー、ドラッグストア）。家族共有 |
| デフォルトリスト | アイテム追加時にリスト未指定ならここへ追加。家族で1つ |
| リストアイテム | リスト内の1行。マスター参照または自由入力 |
| マスター | よく買う商品の登録（名前、画像、メモ） |
| 履歴 | 完了したリストのスナップショット |

## ユースケース

| ID | ユースケース | ロール | 優先度 |
| --- | --- | --- | --- |
| UC-SHOP-001 | 買い物リスト一覧を見る | user, admin | 高 |
| UC-SHOP-002 | リスト内アイテムの完了をマークする | user, admin | 高 |
| UC-SHOP-003 | リストにアイテムを追加する | user, admin | 高 |
| UC-SHOP-004 | マスターからアイテムを追加する | user, admin | 高 |
| UC-SHOP-005 | マスターを作成・編集する（画像含む） | user, admin | 高 |
| UC-SHOP-006 | リストを完了して履歴にする | user, admin | 中 |
| UC-SHOP-007 | 新しいリストを作成する | user, admin | 高 |
| UC-SHOP-008 | デフォルトリストを変更する | user, admin | 高 |
| UC-SHOP-009 | 過去の買い物履歴を参照する | user, admin | 中 |
| UC-SHOP-010 | 補充アラートを受け取る | user, admin | 低（未来） |

## 要件

### フェーズ 1（今回）

| ID | 要件 | 状態 |
| --- | --- | --- |
| FR-SHOP-001 | 複数の買い物リストを家族で共有管理 | 未着手 |
| FR-SHOP-002 | デフォルトリストを1つ指定可能 | 未着手 |
| FR-SHOP-003 | リスト未指定の追加はデフォルトリストへ | 未着手 |
| FR-SHOP-004 | リスト内アイテムの表示・完了マーク | 未着手 |
| FR-SHOP-005 | リストへのアイテム追加（自由入力） | 未着手 |
| FR-SHOP-006 | 商品マスターの CRUD | 未着手 |
| FR-SHOP-007 | マスター画像のアップロード・表示 | 未着手 |
| FR-SHOP-008 | リスト完了と履歴保存 | 未着手 |
| FR-SHOP-009 | 履歴一覧・詳細参照 | 未着手 |

### 未来

| ID | 要件 | 状態 |
| --- | --- | --- |
| FR-SHOP-F001 | 購入履歴からの補充アラート | 未決 |
| FR-SHOP-F002 | アラートからリストへの追加確認 | 未決 |

## 画面

| 画面 | パス | 説明 | 状態 |
| --- | --- | --- | --- |
| リスト一覧 | `/shopping` | リスト選択、デフォルト表示、新規作成 | 未着手 |
| リスト詳細 | `/shopping/lists/:id` | アイテム一覧、完了マーク、追加 | 未着手 |
| マスター一覧 | `/shopping/masters` | 商品マスター管理 | 未着手 |
| マスター編集 | `/shopping/masters/:id` | 名前・画像・メモ編集 | 未着手 |
| 履歴一覧 | `/shopping/history` | 完了済みリスト | 未着手 |
| 履歴詳細 | `/shopping/history/:id` | スナップショット表示 | 未着手 |

### 画面遷移

```text
/shopping
├── リストカード → /shopping/lists/:id
├── マスター管理 → /shopping/masters
└── 履歴 → /shopping/history

/shopping/lists/:id
├── アイテム完了トグル（インライン）
├── アイテム追加（インライン or モーダル）
├── マスターから追加
└── リスト完了 → 履歴へ

Home クイックアクセス QA-002
└── モーダルでデフォルトリストへ追加
```

### リスト詳細 UI（概略）

```text
┌─────────────────────────────────┐
│ スーパー（デフォルト）            │
├─────────────────────────────────┤
│ ☐ 牛乳                          │
│ ☑ パン                          │
│ ☐ 卵                            │
├─────────────────────────────────┤
│ [+ 追加]  [マスターから] [完了]   │
└─────────────────────────────────┘
```

## API

ベースパス: `/api/shopping`

### リスト

| メソッド | パス | 概要 | 認可 |
| --- | --- | --- | --- |
| `GET` | `/api/shopping/lists` | リスト一覧 | user, admin |
| `POST` | `/api/shopping/lists` | リスト作成 | user, admin |
| `GET` | `/api/shopping/lists/{id}` | リスト詳細 + アイテム | user, admin |
| `PATCH` | `/api/shopping/lists/{id}` | 名前変更、デフォルト指定 | user, admin |
| `POST` | `/api/shopping/lists/{id}/complete` | リスト完了 → 履歴化 | user, admin |

### リストアイテム

| メソッド | パス | 概要 | 認可 |
| --- | --- | --- | --- |
| `POST` | `/api/shopping/lists/{id}/items` | アイテム追加 | user, admin |
| `POST` | `/api/shopping/items` | デフォルトリストへ追加（`list_id` 省略可） | user, admin |
| `PATCH` | `/api/shopping/items/{id}` | 完了トグル、メモ更新 | user, admin |
| `DELETE` | `/api/shopping/items/{id}` | アイテム削除 | user, admin |

### マスター

| メソッド | パス | 概要 | 認可 |
| --- | --- | --- | --- |
| `GET` | `/api/shopping/masters` | マスター一覧 | user, admin |
| `POST` | `/api/shopping/masters` | マスター作成 | user, admin |
| `GET` | `/api/shopping/masters/{id}` | マスター詳細 | user, admin |
| `PATCH` | `/api/shopping/masters/{id}` | マスター更新 | user, admin |
| `DELETE` | `/api/shopping/masters/{id}` | マスター削除 | user, admin |
| `POST` | `/api/shopping/masters/{id}/image` | 画像アップロード | user, admin |

### 履歴

| メソッド | パス | 概要 | 認可 |
| --- | --- | --- | --- |
| `GET` | `/api/shopping/history` | 履歴一覧 | user, admin |
| `GET` | `/api/shopping/history/{id}` | 履歴詳細 | user, admin |

### サマリー（Home ダッシュボード用）

| メソッド | パス | 概要 | 認可 |
| --- | --- | --- | --- |
| `GET` | `/api/shopping/summary` | 未完了件数など | user, admin |

### リクエスト例

**デフォルトリストへアイテム追加** `POST /api/shopping/items`

```json
{
  "name": "牛乳",
  "master_id": null
}
```

`list_id` を省略するとデフォルトリストに追加します。

**完了トグル** `PATCH /api/shopping/items/{id}`

```json
{
  "is_checked": true
}
```

## データモデル

### shopping_lists

| カラム | 型 | 説明 |
| --- | --- | --- |
| `id` | UUID | PK |
| `name` | string | リスト名 |
| `is_default` | boolean | 家族内で1つのみ true |
| `status` | enum | `active`, `completed` |
| `created_by` | UUID | FK → users |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `completed_at` | timestamptz | nullable |

制約: 家族内で `is_default = true` は同時に1件のみ（アプリ層または partial unique index）。

### shopping_list_items

| カラム | 型 | 説明 |
| --- | --- | --- |
| `id` | UUID | PK |
| `list_id` | UUID | FK → shopping_lists |
| `master_id` | UUID | FK → shopping_item_masters, nullable |
| `name` | string | 表示名（マスター参照時もスナップショット保持） |
| `is_checked` | boolean | 完了マーク |
| `sort_order` | int | 表示順 |
| `created_by` | UUID | FK → users |
| `created_at` | timestamptz | |
| `checked_at` | timestamptz | nullable |

### shopping_item_masters

| カラム | 型 | 説明 |
| --- | --- | --- |
| `id` | UUID | PK |
| `name` | string | 商品名 |
| `note` | string | メモ, nullable |
| `image_object_id` | UUID | FK → stored_objects, nullable |
| `created_by` | UUID | FK → users |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### shopping_list_history

リスト完了時にスナップショットを保存します。

| カラム | 型 | 説明 |
| --- | --- | --- |
| `id` | UUID | PK |
| `list_id` | UUID | 元リスト ID（参照用） |
| `list_name` | string | 完了時の名前 |
| `completed_by` | UUID | FK → users |
| `completed_at` | timestamptz | |
| `snapshot` | JSONB | 完了時のアイテム一覧 |

`snapshot` 例:

```json
{
  "items": [
    { "name": "牛乳", "is_checked": true },
    { "name": "パン", "is_checked": true }
  ]
}
```

### stored_objects

ファイルのメタデータ。詳細: [`../../architecture/object-storage.md`](../../architecture/object-storage.md)

| カラム | 型 | 説明 |
| --- | --- | --- |
| `id` | UUID | PK |
| `storage_path` | string | `FILE_STORAGE_ROOT` からの相対パス（例: `shopping/masters/...`） |
| `content_type` | string | MIME |
| `size_bytes` | int | サイズ |
| `created_by` | UUID | FK → users |
| `created_at` | timestamptz | |

### ER（概略）

```text
users
  ├── shopping_lists
  │     └── shopping_list_items ──► shopping_item_masters
  ├── shopping_item_masters ──► stored_objects
  └── shopping_list_history
```

## 権限

| ロール | 権限 |
| --- | --- |
| `user` | リスト・マスター・履歴の参照・作成・更新・削除（家族共有） |
| `admin` | 同上 |

初期は家族内全員が同等に操作可能です。将来、マスター管理を admin のみに制限するかは未決です。

## リスト完了の挙動

1. 全アイテムの状態を `snapshot` に保存
2. `shopping_list_history` レコード作成
3. `shopping_lists.status` を `completed` に更新
4. `shopping_list_items` を削除（またはアーカイブ。初期は削除）
5. 新しい `active` リストを同じ名前で自動作成するかは **未決**（初期は手動で新規作成）

## 未決事項

| 項目 | 推奨 | 状態 |
| --- | --- | --- |
| リスト完了後の新リスト自動作成 | 手動作成 | 仮決定 |
| マスター削除時の既存リストアイテム | `master_id` を NULL にし表示名は維持 | 仮決定 |
| デフォルトリストの初期作成 | 初回アクセス時に「買い物」リストを自動作成 | 仮決定 |

## 実装フェーズ案

| 順序 | 内容 |
| --- | --- |
| 1 | AppShell + Home（固定クイックアクセス） |
| 2 | リスト CRUD + アイテム追加・完了 |
| 3 | マスター CRUD（画像なし） |
| 4 | ファイルストレージ連携 + マスター画像 |
| 5 | 履歴 |
| 6 | Home ダッシュボード集約 |

## 関連

- [`home.md`](home.md)
- [`app-shell.md`](app-shell.md)
- [`../../architecture/object-storage.md`](../../architecture/object-storage.md)
