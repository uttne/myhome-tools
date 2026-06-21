# API 設計

## 概要

FastAPI で提供する API の一覧、リクエスト、レスポンス、認証・認可要件を整理します。

ベース URL:

| 環境 | URL |
| --- | --- |
| 開発（Compose） | `http://localhost:8080` |
| 開発（ローカル直接起動） | `http://localhost:5173`（Vite proxy 経由） |
| 本番 | `https://app.example.com`（TBD） |

実装: `backend/app/main.py`

## 共通

### 認証方式

| 方式 | ヘッダー / Cookie | 用途 |
| --- | --- | --- |
| Cloudflare Access | `Cf-Access-Authenticated-User-Email` | 外部公開経路 |
| ローカル JWT | Cookie `myhome_access_token` | LAN、開発、フォールバック |

Cookie を使う API では `credentials: "include"` が必要です。

### エラーレスポンス

FastAPI 標準の HTTPException 形式です。

```json
{"detail": "エラーメッセージ"}
```

| ステータス | 発生条件 |
| --- | --- |
| `400 Bad Request` | パスワード変更時の現パスワード不一致など |
| `401 Unauthorized` | 未認証、ローカルログイン失敗 |
| `403 Forbidden` | Cloudflare ユーザーが許可リスト外 |
| `422 Unprocessable Entity` | リクエストボディのバリデーションエラー |
| `500 Internal Server Error` | サーバー内部エラー |

## ヘルスチェック

### GET /healthz

プロセスの死活確認。認証不要。

**レスポンス** `200 OK`

```json
{"message": "ok"}
```

### GET /readyz

DB 接続を含む準備確認。認証不要。

**レスポンス** `200 OK`

```json
{"message": "ok"}
```

DB 接続失敗時は `500 Internal Server Error`。

## 認証関連 API

### GET /api/me

現在のログインユーザーを返します。

| 項目 | 内容 |
| --- | --- |
| 認証 | Cloudflare Access またはローカル JWT |
| レスポンス | `UserRead` |

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

### POST /api/auth/login

ローカルログイン。認証不要。

**リクエスト** `LoginRequest`

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**レスポンス** `200 OK`

- `UserRead` を返し、認証 Cookie を Set-Cookie します。

**エラー** `401 Unauthorized`

```json
{"detail": "Invalid email or password"}
```

### POST /api/auth/logout

ローカルログアウト。認証 Cookie を削除します。認証不要。

**レスポンス** `200 OK`

```json
{
  "message": "logged out",
  "logout_url": null
}
```

`EXTERNAL_LOGOUT_URL` が設定されている場合、`logout_url` にその URL を返します。

### POST /api/auth/password

自分のローカルパスワードを設定・変更します。

| 項目 | 内容 |
| --- | --- |
| 認証 | ログイン済み |
| レスポンス | `UserRead` |

**リクエスト** `PasswordChangeRequest`

初回設定（`password_hash` が NULL の場合）:

```json
{
  "new_password": "new-secret"
}
```

変更（既存パスワードがある場合）:

```json
{
  "current_password": "old-secret",
  "new_password": "new-secret"
}
```

**エラー** `400 Bad Request`

```json
{"detail": "Current password is invalid"}
```

## 管理者 API

未実装。追加予定:

| メソッド | パス | 概要 | 認可 |
| --- | --- | --- | --- |
| `GET` | `/api/admin/users` | ユーザー一覧 | `admin` |
| `PATCH` | `/api/admin/users/{id}` | ユーザー無効化、ロール変更 | `admin` |
| `POST` | `/api/admin/users/{id}/reset-password` | パスワードリセット要求 | `admin` |

## 業務 API

未実装。`application/design.md` で機能確定後に追加します。

## スキーマ定義

| スキーマ | ファイル | 用途 |
| --- | --- | --- |
| `UserRead` | `backend/app/schemas.py` | ユーザー情報のレスポンス |
| `LoginRequest` | 同上 | ログインリクエスト |
| `PasswordChangeRequest` | 同上 | パスワード変更リクエスト |
| `MessageResponse` | 同上 | 汎用メッセージ |
| `LogoutResponse` | 同上 | ログアウトレスポンス |
