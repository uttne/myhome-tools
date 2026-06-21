# ドメインモデル

## 概要

アプリケーションで扱う主要な概念、エンティティ、関係性を整理します。

SQLModel 定義: `backend/app/models.py`

## エンティティ一覧

| エンティティ | 状態 | 概要 |
| --- | --- | --- |
| User | 実装済み | アプリ利用者 |
| （業務エンティティ） | 未実装 | `application/design.md` で定義予定 |

## User

アプリの認証・認可の中心エンティティです。

### 属性

| 属性 | 型 | 必須 | 概要 |
| --- | --- | --- | --- |
| `id` | UUID | はい | 内部ユーザー ID |
| `email` | string | はい | ログイン識別子。ユニーク、小文字正規化 |
| `password_hash` | string | いいえ | bcrypt ハッシュ。Cloudflare 専用ユーザーは NULL |
| `display_name` | string | いいえ | 表示名 |
| `role` | UserRole | はい | `admin` または `user` |
| `auth_provider` | AuthProvider | はい | 初回作成時の認証元 |
| `is_active` | boolean | はい | ログイン許可状態 |
| `created_at` | datetime (UTC) | はい | 作成日時 |
| `updated_at` | datetime (UTC) | はい | 更新日時 |

### 列挙型

**UserRole**

| 値 | 概要 |
| --- | --- |
| `admin` | 管理者。ユーザー管理、設定変更、全データ操作 |
| `user` | 一般ユーザー。通常機能の利用 |

**AuthProvider**

| 値 | 概要 |
| --- | --- |
| `cloudflare` | Cloudflare Access 経由で JIT 作成 |
| `local` | CLI またはローカルログイン経由で作成 |

### 不変条件

- `email` はシステム内で一意であること。
- JIT プロビジョニングでは `role = user` に固定すること。
- 初期管理者は CLI でのみ `role = admin` として作成すること。
- `password_hash = NULL` のユーザーはローカルログインできないこと。
- `is_active = false` のユーザーは認証できないこと。

## 関係性

現時点では User のみです。業務エンティティ追加時に外部キーと関係を定義します。

```text
User
  └── （将来）業務エンティティへの参照
```

## 状態遷移

### User.is_active

```text
active (true) ←→ inactive (false)
```

無効化は管理者操作（未実装）で行います。

### User.password_hash

```text
NULL → 設定済み → 変更
```

Cloudflare ユーザーが `/api/auth/password` で初回設定する流れを想定しています。

## 今後追加するエンティティ

`application/design.md` の機能モジュール確定後に、ここへ追記します。
