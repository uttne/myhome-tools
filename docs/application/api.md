# API 設計

## 概要

TBD

このファイルには、FastAPI で提供する API の一覧、リクエスト、レスポンス、認証・認可要件を整理します。

## 認証関連 API

| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| `GET` | `/api/me` | 現在のログインユーザーを返す | Cloudflare Access またはローカル JWT |
| `POST` | `/api/auth/login` | ローカルログイン | 未認証 |
| `POST` | `/api/auth/logout` | ローカルログアウト | ローカル JWT |
| `POST` | `/api/auth/password` | 自分のローカルパスワードを設定・変更 | ログイン済み |

## 管理者 API

TBD:

- ユーザー一覧
- ユーザー無効化
- パスワードリセット要求
- ロール変更

## 通常機能 API

TBD

## エラーレスポンス

TBD:

- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `422 Validation Error`
- `500 Internal Server Error`
