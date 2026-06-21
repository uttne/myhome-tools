# API 設計

FastAPI API の索引です。機能ごとの詳細は `features/` を参照してください。

実装: `backend/app/main.py`

## ベース URL

| 環境 | URL |
| --- | --- |
| 開発（Compose） | `http://localhost:8080` |
| 開発（ローカル直接起動） | `http://localhost:5173`（Vite proxy 経由） |
| 本番 | `https://app.example.com`（TBD） |

## 機能別 API 一覧

| 機能 | パス | 仕様 | 状態 |
| --- | --- | --- | --- |
| ヘルスチェック | `/healthz`, `/readyz` | 本ファイル | 実装済み |
| 認証・セッション | `/api/me`, `/api/auth/*` | [`features/auth.md`](features/auth.md) | 実装済み |
| ユーザー管理 | `/api/admin/*` | [`features/auth.md`](features/auth.md) | 未実装 |
| 業務 | `/api/...` | TBD | 未実装 |

## 共通

### 認証方式

| 方式 | ヘッダー / Cookie | 用途 |
| --- | --- | --- |
| Cloudflare Access | `Cf-Access-Authenticated-User-Email` | 外部公開経路 |
| ローカル JWT | Cookie `myhome_access_token` | LAN、開発、フォールバック |

Cookie を使う API では `credentials: "include"` が必要です。

詳細: [`features/auth.md`](features/auth.md), [`../architecture/authentication.md`](../architecture/authentication.md)

### エラーレスポンス

```json
{"detail": "エラーメッセージ"}
```

| ステータス | 発生条件 |
| --- | --- |
| `400 Bad Request` | バリデーション・業務ルール違反 |
| `401 Unauthorized` | 未認証 |
| `403 Forbidden` | 認可拒否 |
| `422 Unprocessable Entity` | リクエスト形式エラー |
| `500 Internal Server Error` | サーバー内部エラー |

## ヘルスチェック

### GET /healthz

プロセス死活確認。認証不要。`200 OK` → `{"message": "ok"}`

### GET /readyz

DB 接続確認。認証不要。成功 `200 OK`、DB 失敗 `500`

## スキーマ索引

| スキーマ | 機能 | 定義 |
| --- | --- | --- |
| `UserRead` | 認証 | `backend/app/schemas.py` |
| `LoginRequest` | 認証 | 同上 |
| `PasswordChangeRequest` | 認証 | 同上 |
| `LogoutResponse` | 認証 | 同上 |
| `MessageResponse` | 共通 | 同上 |

新機能追加時は `features/<機能>.md` にスキーマを記載し、ここに索引行を追加します。
