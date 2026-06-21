# 買い物リスト

| 項目 | 内容 |
| --- | --- |
| 機能 ID | shopping |
| 状態 | 未着手 |
| フェーズ | 1 |

## 概要

グループ単位で共有する買い物リスト管理サービスです。

複数のリストを長期間使い続け、アイテムの追加・完了マークを繰り返します。リストに「完了」状態は持たず、不要になったら **アーカイブ** します。

複数リストを作成でき、グループごとにデフォルトリストを1つ指定します。リスト指定なしでアイテムを追加した場合はデフォルトリストに追加されます。

商品マスターに画像を登録でき、画像は `FILE_STORAGE_ROOT` 配下に保存します（本番は JuiceFS PVC）。

関連: [`groups.md`](groups.md)、[`../../architecture/object-storage.md`](../../architecture/object-storage.md)

## コンセプト

| 概念 | 説明 |
| --- | --- |
| グループ | データスコープ。詳細は [`groups.md`](groups.md) |
| リスト | 買い物の単位（例: スーパー、ドラッグストア）。長期利用 |
| デフォルトリスト | アイテム追加時にリスト未指定ならここへ追加。グループ内で1つ |
| リストアイテム | リスト内の1行。マスター参照または自由入力 |
| マスター | よく買う商品の登録（名前、画像、メモ）。グループスコープ |
| アーカイブ | 使わなくなったリストを論理削除する状態 |

## ユースケース

| ID | ユースケース | ロール | 優先度 |
| --- | --- | --- | --- |
| UC-SHOP-001 | グループの買い物リスト一覧を見る | user, admin | 高 |
| UC-SHOP-002 | リスト内アイテムの完了をマークする | user, admin | 高 |
| UC-SHOP-003 | リストにアイテムを追加する | user, admin | 高 |
| UC-SHOP-004 | マスターからアイテムを追加する | user, admin | 高 |
| UC-SHOP-005 | マスターを作成・編集する（画像含む） | user, admin | 高 |
| UC-SHOP-006 | リストをアーカイブする | user, admin | 中 |
| UC-SHOP-007 | アーカイブ済みリストを完全削除する | user, admin | 低 |
| UC-SHOP-008 | 新しいリストを作成する | user, admin | 高 |
| UC-SHOP-009 | デフォルトリストを変更する | user, admin | 高 |
| UC-SHOP-010 | 補充アラートを受け取る | user, admin | 低（未来） |

## 要件

### フェーズ 1

| ID | 要件 | 状態 |
| --- | --- | --- |
| FR-SHOP-001 | グループ単位で複数リストを共有管理 | 未着手 |
| FR-SHOP-002 | グループごとにデフォルトリストを1つ指定 | 未着手 |
| FR-SHOP-003 | リスト未指定の追加はデフォルトリストへ | 未着手 |
| FR-SHOP-004 | リスト内アイテムの表示・完了マーク | 未着手 |
| FR-SHOP-005 | リストへのアイテム追加（自由入力） | 未着手 |
| FR-SHOP-006 | 商品マスターの CRUD（グループスコープ） | 未着手 |
| FR-SHOP-007 | マスター画像のアップロード・表示 | 未着手 |
| FR-SHOP-008 | リストのアーカイブ（論理削除） | 未着手 |
| FR-SHOP-009 | アーカイブ済みリストの完全削除 | 未着手 |

### フェーズ 2 以降

| ID | 要件 | 状態 |
| --- | --- | --- |
| FR-SHOP-F001 | ルール付きソート view（家族共有） | 未決 |
| FR-SHOP-F002 | 購入履歴からの補充アラート | 未決 |
| FR-SHOP-F003 | リスト完了スナップショット（履歴） | 未決 |

## 画面

| 画面 | パス | 説明 | 状態 |
| --- | --- | --- | --- |
| リスト一覧 | `/shopping` | リスト選択、デフォルト表示、新規作成 | 未着手 |
| リスト詳細 | `/shopping/lists/:id` | アイテム一覧、完了マーク、追加 | 未着手 |
| マスター一覧 | `/shopping/masters` | 商品マスター管理 | 未着手 |
| マスター編集 | `/shopping/masters/:id` | 名前・画像・メモ編集 | 未着手 |
| アーカイブ一覧 | `/shopping/archived` | アーカイブ済みリスト | 未着手 |

### 画面遷移

```text
/shopping
├── リストカード → /shopping/lists/:id
├── マスター管理 → /shopping/masters
└── アーカイブ → /shopping/archived

/shopping/lists/:id
├── アイテム完了トグル（インライン）
├── アイテム追加（インライン or モーダル）
├── マスターから追加
└── アーカイブ

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
│ [+ 追加]  [マスターから] [アーカイブ] │
└─────────────────────────────────┘
```

## API

ベースパス: `/api/v1/shopping`

すべてのエンドポイントは `group_id` でスコープします（クエリまたはボディ）。

`group_id` 省略時: ユーザーのデフォルトグループ設定があればそれを使用し、未設定なら **個人グループ**（フェーズ1は個人グループのみ。設定 UI はフェーズ2）。共有グループのデータは UI でグループを切り替えて操作します。

### リスト

| メソッド | パス | 概要 | 認可 |
| --- | --- | --- | --- |
| `GET` | `/api/v1/shopping/lists` | リスト一覧（`status=active` デフォルト） | メンバー |
| `POST` | `/api/v1/shopping/lists` | リスト作成 | メンバー |
| `GET` | `/api/v1/shopping/lists/{id}` | リスト詳細 + アイテム | メンバー |
| `PATCH` | `/api/v1/shopping/lists/{id}` | 名前変更、デフォルト指定 | メンバー |
| `POST` | `/api/v1/shopping/lists/{id}/archive` | アーカイブ（論理削除） | メンバー |
| `DELETE` | `/api/v1/shopping/lists/{id}` | 完全削除（**archived のみ**） | メンバー |

### リストアイテム

| メソッド | パス | 概要 | 認可 |
| --- | --- | --- | --- |
| `POST` | `/api/v1/shopping/lists/{id}/items` | アイテム追加 | メンバー |
| `POST` | `/api/v1/shopping/items` | デフォルトリストへ追加（`list_id` 省略可） | メンバー |
| `PATCH` | `/api/v1/shopping/items/{id}` | 完了トグル、メモ更新 | メンバー |
| `DELETE` | `/api/v1/shopping/items/{id}` | アイテム削除 | メンバー |

**表示順（フェーズ1）**: `GET` 系で `sort` クエリを受け付けます。並べ替えの保存はしません。

| `sort` 値 | 説明 |
| --- | --- |
| `created_at` | 追加順（デフォルト） |
| `name` | 名前昇順 |
| `unchecked_first` | 未完了を上に、その後名前順 |

### マスター

| メソッド | パス | 概要 | 認可 |
| --- | --- | --- | --- |
| `GET` | `/api/v1/shopping/masters` | マスター一覧 | メンバー |
| `POST` | `/api/v1/shopping/masters` | マスター作成 | メンバー |
| `GET` | `/api/v1/shopping/masters/{id}` | マスター詳細 | メンバー |
| `PATCH` | `/api/v1/shopping/masters/{id}` | マスター更新 | メンバー |
| `DELETE` | `/api/v1/shopping/masters/{id}` | マスター削除（画像ファイルも削除） | メンバー |
| `POST` | `/api/v1/shopping/masters/{id}/image` | 画像アップロード | メンバー |

### ファイル配信

| メソッド | パス | 概要 | 認可 |
| --- | --- | --- | --- |
| `GET` | `/api/v1/files/{id}` | 画像などのバイナリ配信 | 認証済み user, admin |

詳細: [`../../architecture/object-storage.md`](../../architecture/object-storage.md)

### サマリー（Home ダッシュボード用）

| メソッド | パス | 概要 | 認可 |
| --- | --- | --- | --- |
| `GET` | `/api/v1/shopping/summary` | 未完了件数など | メンバー |

`group_id` クエリを省略した場合は **個人グループ** を対象とします（他の shopping API と同じ）。

フェーズ1では `/api/v1/home/summary` は作りません。

### リクエスト例

**デフォルトリストへアイテム追加** `POST /api/v1/shopping/items?group_id={uuid}`

`group_id` 省略時は個人グループを対象とします。

```json
{
  "name": "牛乳",
  "master_id": null
}
```

**完了トグル** `PATCH /api/v1/shopping/items/{id}`

```json
{
  "is_checked": true
}
```

**リスト詳細（表示順指定）** `GET /api/v1/shopping/lists/{id}?sort=unchecked_first`

### GET /api/v1/shopping/summary

`group_id` クエリを省略した場合は個人グループを対象とします。

```json
{
  "group_id": "uuid",
  "total_open_items": 12,
  "default_list_id": "uuid",
  "default_list_name": "スーパー",
  "default_list_open_items": 5
}
```

## データモデル

### shopping_lists

| カラム | 型 | 説明 |
| --- | --- | --- |
| `id` | UUID | PK |
| `group_id` | UUID | FK → groups |
| `name` | string | リスト名 |
| `is_default` | boolean | グループ内で1つのみ true（active 時） |
| `status` | enum | `active`, `archived` |
| `created_by` | UUID | FK → users |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `archived_at` | timestamptz | nullable |

制約: `(group_id)` WHERE `is_default = true AND status = 'active'` に partial unique index。

### shopping_list_items

| カラム | 型 | 説明 |
| --- | --- | --- |
| `id` | UUID | PK |
| `list_id` | UUID | FK → shopping_lists |
| `master_id` | UUID | FK → shopping_item_masters, nullable |
| `name` | string | 表示名（マスター参照時もスナップショット保持） |
| `is_checked` | boolean | 完了マーク |
| `created_by` | UUID | FK → users |
| `created_at` | timestamptz | |
| `checked_at` | timestamptz | nullable |
| `updated_at` | timestamptz | 競合更新は Last-Write-Wins |

`sort_order` カラムはフェーズ1では持ちません。表示順は GET の `sort` クエリで決めます。

### shopping_item_masters

| カラム | 型 | 説明 |
| --- | --- | --- |
| `id` | UUID | PK |
| `group_id` | UUID | FK → groups |
| `name` | string | 商品名 |
| `note` | string | メモ, nullable |
| `image_object_id` | UUID | FK → stored_objects, nullable |
| `created_by` | UUID | FK → users |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### stored_objects

ファイルのメタデータ。詳細: [`../../architecture/object-storage.md`](../../architecture/object-storage.md)

| カラム | 型 | 説明 |
| --- | --- | --- |
| `id` | UUID | PK |
| `storage_path` | string | `FILE_STORAGE_ROOT` からの相対パス |
| `content_type` | string | MIME |
| `size_bytes` | int | サイズ |
| `created_by` | UUID | FK → users |
| `created_at` | timestamptz | |

### ER（概略）

```text
groups
  ├── shopping_lists
  │     └── shopping_list_items ──► shopping_item_masters
  └── shopping_item_masters ──► stored_objects
```

## 権限

| ロール | 権限 |
| --- | --- |
| `user` | 所属グループのリスト・マスターの CRUD |
| `admin` | 同上 + 共有グループ作成・メンバー追加（フェーズ1） |

## リストのライフサイクル

1. **active**: 通常利用。アイテムの追加・完了マークを繰り返す
2. **archived**: `POST .../archive` で論理削除。一覧からは除外（アーカイブ画面で参照）
3. **完全削除**: `DELETE` は `archived` のみ受け付け。アイテムとリストレコードを削除

初回デフォルトリストの自動作成は **行いません**。ユーザーが手動でリストを作成します。

## マスター削除

- 既存リストアイテムの `master_id` を NULL にし、表示名は維持
- 紐づく `stored_objects` と実ファイルを削除

## 未決事項

なし（フェーズ1）。将来の変更は `../../open-questions.md` を参照。

## 実装フェーズ案

| 順序 | 内容 |
| --- | --- |
| 1 | グループ基盤 + AppShell + Home |
| 2 | リスト CRUD + アイテム追加・完了 |
| 3 | マスター CRUD（画像なし） |
| 4 | ファイルストレージ連携 + マスター画像 |
| 5 | アーカイブ + Home ダッシュボード |

## 関連

- [`groups.md`](groups.md)
- [`home.md`](home.md)
- [`app-shell.md`](app-shell.md)
- [`../../architecture/object-storage.md`](../../architecture/object-storage.md)
