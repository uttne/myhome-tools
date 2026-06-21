# 認証・セッション

| 項目 | 内容 |
| --- | --- |
| 機能 ID | auth |
| 状態 | 実装済み（ユーザー管理 API は未実装） |
| フェーズ | 0 |

## 概要

Cloudflare Access とローカル JWT Cookie によるハイブリッド認証を提供します。

- 外部公開経路: Cloudflare Access ヘッダー + JIT プロビジョニング
- LAN / 開発 / フォールバック: ローカル JWT Cookie（`myhome_access_token`）
- 認証方式と `role` による認可は分離

アーキテクチャ詳細: `../../architecture/authentication.md`

## ユースケース

| ID | ユースケース | ロール | 状態 |
| --- | --- | --- | --- |
| UC-AUTH-001 | 認証状態を確認する | 全員 | 実装済み |
| UC-AUTH-002 | ローカルアカウントでログインする | 全員 | 実装済み |
| UC-AUTH-003 | ログアウトする | 全員 | 実装済み |
| UC-AUTH-004 | ローカルパスワードを設定・変更する | ログイン済み | 実装済み（API のみ、画面未実装） |
| UC-AUTH-005 | Cloudflare Access 経由で初回ログインする | 全員（CF Access 許可者） | 実装済み |
| UC-AUTH-006 | 初期管理者を CLI で作成する | — | 実装済み |
| UC-ADMIN-001 | ユーザー一覧を確認する | admin | 未実装 |
| UC-ADMIN-002 | ユーザーを無効化する | admin | 未実装 |
| UC-ADMIN-003 | パスワードリセットを要求する | admin | 未実装 |

## 要件

| ID | 要件 | 状態 |
| --- | --- | --- |
| FR-AUTH-001 | `/api/v1/me` で現在ユーザーを取得 | 実装済み |
| FR-AUTH-002 | メール + パスワードでローカルログイン | 実装済み |
| FR-AUTH-003 | Cookie 削除、外部ログアウト URL 対応 | 実装済み |
| FR-AUTH-004 | ローカルパスワードの初回設定・変更 | 実装済み |
| FR-AUTH-005 | Cloudflare ヘッダーによる JIT プロビジョニング | 実装済み |
| FR-AUTH-006 | CLI による初期管理者作成 | 実装済み |
| FR-AUTH-007 | Cloudflare Access JWT の署名検証 | 未実装（フェーズ3） |
| FR-ADMIN-001 | 管理者向けユーザー一覧 | 未実装 |
| FR-ADMIN-002 | ユーザー無効化 | 未実装 |
| FR-ADMIN-003 | パスワードリセット要求 | 未実装 |

## 画面

実装: `frontend/src/App.tsx`

| 画面 | パス | 概要 | 状態 |
| --- | --- | --- | --- |
| ホーム | `/` | 未認証: ログイン / 認証済み: 情報表示（フェーズ1で `/home` へリダイレクト） | 実装済み |
| ログアウト | `/logout` | ログアウト API 実行後リダイレクト | 実装済み |
| パスワード設定 | `/settings/password` | ローカルパスワード設定・変更 | 未実装 |

### 認証判定

アプリ初期ロード時（`/`）に `GET /api/v1/me` を呼び出します。

**フェーズ 0（現状）**

| 結果 | 挙動 |
| --- | --- |
| `200 OK` | `/` にログイン済み情報（email / role / provider）を表示 |
| `401 Unauthorized` | ローカルログインフォーム |
| その他 | エラーメッセージ |

**フェーズ 1（AppShell 導入後）**

| 結果 | 挙動 |
| --- | --- |
| `200 OK` | `/home` へリダイレクト |
| `401 Unauthorized` | ローカルログインフォーム |
| その他 | エラーメッセージ |

### 画面遷移

**フェーズ 0（現状）**

```text
/ (HomePage)
├── 未認証 → ローカルログインフォーム
│   └── ログイン成功 → / に情報表示
└── 認証済み → / に情報表示

/logout (LogoutPage)
└── POST /api/v1/auth/logout → logout_url または /
```

**フェーズ 1（AppShell 導入後）**

```text
/ (HomePage)
├── 未認証 → ローカルログインフォーム
│   └── ログイン成功 → /home へ
└── 認証済み → /home へリダイレクト

/settings/password
└── POST /api/v1/auth/password

/logout (LogoutPage)
└── POST /api/v1/auth/logout → logout_url または /
```

### ホーム（`/`）未認証時

| 要素 | 内容 |
| --- | --- |
| タイトル | ローカルログイン |
| 入力 | メールアドレス、パスワード |
| 操作 | ログインボタン |

### ホーム（`/`）認証済み時

| 要素 | 内容 |
| --- | --- |
| 表示 | Email、Role、Provider |
| 操作 | ログアウトボタン |

## API

実装: `backend/app/main.py`

| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| `GET` | `/api/v1/me` | 現在のユーザー | Cloudflare / JWT |
| `POST` | `/api/v1/auth/login` | ローカルログイン | 不要 |
| `POST` | `/api/v1/auth/logout` | ログアウト | 不要 |
| `POST` | `/api/v1/auth/password` | パスワード設定・変更 | ログイン済み |

### GET /api/v1/me

**レスポンス例** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "display_name": null,
  "role": "user",
  "auth_provider": "local"
}
```

### POST /api/v1/auth/login

**リクエスト**

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

成功時: `UserRead` + Set-Cookie。失敗時: `401`

### POST /api/v1/auth/logout

**レスポンス**

```json
{
  "message": "logged out",
  "logout_url": null
}
```

### POST /api/v1/auth/password

初回設定: `new_password` のみ。変更時: `current_password` + `new_password`。

### 管理者 API（未実装）

| メソッド | パス | 概要 | 認可 |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/users` | ユーザー一覧 | admin |
| `PATCH` | `/api/v1/admin/users/{id}` | 無効化、ロール変更 | admin |
| `POST` | `/api/v1/admin/users/{id}/reset-password` | リセット要求 | admin |

### スキーマ

| スキーマ | 用途 |
| --- | --- |
| `UserRead` | ユーザー情報レスポンス |
| `LoginRequest` | ログイン |
| `PasswordChangeRequest` | パスワード変更 |
| `LogoutResponse` | ログアウト |

定義: `backend/app/schemas.py`

## データモデル

### User（`users`）

| 属性 | 型 | 必須 | 概要 |
| --- | --- | --- | --- |
| `id` | UUID | はい | 内部 ID |
| `email` | string | はい | ユニーク、小文字正規化 |
| `password_hash` | string | いいえ | bcrypt。Cloudflare ユーザーは NULL |
| `display_name` | string | いいえ | 表示名 |
| `role` | UserRole | はい | `admin` / `user` |
| `auth_provider` | AuthProvider | はい | `cloudflare` / `local` |
| `is_active` | boolean | はい | ログイン許可 |
| `created_at` | datetime | はい | UTC |
| `updated_at` | datetime | はい | UTC |

**UserRole**: `admin`, `user`  
**AuthProvider**: `cloudflare`, `local`

定義: `backend/app/models.py`  
DB 詳細: `../../architecture/database.md`

### 不変条件

- JIT では `role = user` 固定。管理者は CLI のみ
- `password_hash = NULL` はローカルログイン不可
- `is_active = false` は認証不可

## 権限

| ロール | 本機能での権限 |
| --- | --- |
| `admin` | 全認証機能 + 将来のユーザー管理 |
| `user` | 自分のセッション、パスワード設定 |

## 未決事項

- Cloudflare Access JWT 検証 → フェーズ3（`../../roadmap.md`）

## 関連 Issue

TBD（GitHub Issues で管理）
