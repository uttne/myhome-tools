# 認証・認可設計

## 概要

本システムでは、Cloudflare Access による外部公開時の認証と、アプリケーション独自のローカル認証を併用します。

Cloudflare Access 経由かローカル JWT 経由かは本人確認の方法であり、アプリ内権限とは分離します。アプリ内の認可は `role` で判断します。

## 実装状態

| 機能 | 状態 | 実装 |
| --- | --- | --- |
| Cloudflare Access ヘッダー認証 | 実装済み | `Cf-Access-Authenticated-User-Email` |
| Cloudflare JIT プロビジョニング | 実装済み | 許可メール一覧一致時に `user` ロールで作成 |
| ローカル JWT Cookie 認証 | 実装済み | Cookie 名 `myhome_access_token` |
| ローカルログイン / ログアウト | 実装済み | `/api/auth/login`, `/api/auth/logout` |
| パスワード設定・変更 | 実装済み | `/api/auth/password` |
| 初期管理者 CLI | 実装済み | `python -m app.create_admin` |
| `Cf-Access-Jwt-Assertion` 署名検証 | 未実装 | 将来追加予定 |
| 管理者向けユーザー管理 API | 未実装 | 将来追加予定 |

## FastAPI の認証優先順位

API リクエストを受け取った FastAPI は、次の順序でユーザーを特定します。

1. Cloudflare Access 認証
   - `Cf-Access-Authenticated-User-Email` ヘッダーを確認します。
   - メールアドレスが `ALLOWED_CLOUDFLARE_EMAILS` に含まれる場合、既存ユーザーを返すか JIT プロビジョニングで作成します。
   - 許可リストに含まれない場合は `403 Forbidden` を返します。
2. ローカル JWT 認証
   - Cloudflare ヘッダーが存在しない場合、Cookie `myhome_access_token` の JWT を検証します。
   - 主に LAN 内アクセス、開発環境、Cloudflare 側障害時のフォールバックとして利用します。
3. 未認証
   - どちらの認証情報も存在しない、または無効な場合は `401 Unauthorized` を返します。

実装: `backend/app/auth.py` の `get_current_user`

## JIT プロビジョニング

Cloudflare Access 経由で未登録ユーザーがアクセスした場合、次の条件を満たす場合のみユーザーを自動作成します。

- `Cf-Access-Authenticated-User-Email` が存在すること。
- メールアドレスが `ALLOWED_CLOUDFLARE_EMAILS`（カンマ区切り）に含まれること。空の場合は JIT を行いません。
- 初期ロールは `user` に固定すること。
- 管理者ロールは JIT プロビジョニングでは付与しないこと。

## ローカル認証・セッション

ローカル JWT はブラウザ保存の安全性を優先し、Cookie で扱います。

| 設定 | 環境変数 | 開発デフォルト | 本番推奨 |
| --- | --- | --- | --- |
| Cookie 名 | `AUTH_COOKIE_NAME` | `myhome_access_token` | 同左 |
| 有効期限（分） | `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | 要検討 |
| Secure フラグ | `SECURE_COOKIES` | `false` | `true` |
| HttpOnly | 固定 | `true` | `true` |
| SameSite | 固定 | `Lax` | `Lax` |

JWT は HS256 で署名し、`JWT_SECRET_KEY` を secret として管理します。

状態変更 API では CSRF リスクを考慮します。まずは `SameSite=Lax` を基本とし、管理者操作やパスワード変更など重要操作では CSRF トークンまたは再認証を検討します。

## 認可方針

| ロール | 想定権限 |
| --- | --- |
| `admin` | ユーザー管理、設定変更、全データ操作 |
| `user` | 通常機能の利用 |

現時点では API ごとのロールチェックは未実装です。管理者向け API 追加時に `admin` ロールを要求する dependency を追加します。

## ユーザー管理

初期管理者は JIT プロビジョニングではなく CLI で作成します。

```bash
task admin:create ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=password
```

家族ユーザーの追加方法:

1. 管理者が `ALLOWED_CLOUDFLARE_EMAILS` に許可メールアドレスを追加します。
2. 対象ユーザーが Cloudflare Access 経由で初回ログインします。
3. 条件を満たせば JIT プロビジョニングで一般ユーザーとして作成されます。
4. LAN 内でも利用する場合、ログイン済み状態で `/api/auth/password` によりローカルパスワードを設定します。

パスワード設定・リセット:

- `password_hash = NULL` のユーザーはローカルログインできません。
- 本人が Cloudflare Access 経由でログイン済みの場合、自分のローカルパスワードを設定できます。
- 初回設定時は `current_password` を省略できます。既存パスワードがある場合は `current_password` が必須です。

## フロントエンドの認証判定

アプリ初期ロード時に FastAPI の `/api/me` を呼び出し、認証状態を判定します。

| `/api/me` の結果 | フロントエンドの挙動 |
| --- | --- |
| `200 OK` | ログイン済みとしてメイン画面を描画 |
| `401 Unauthorized` | ローカルログイン画面を表示 |
| `403 Forbidden` | Cloudflare ユーザーが許可リスト外（現状はエラー表示） |

ログアウトは `/logout` ページで `/api/auth/logout` を呼び出し、`logout_url` があれば外部認証基盤へリダイレクトします。

## 将来追加予定

- `Cf-Access-Jwt-Assertion` の署名、audience、有効期限検証
- 管理者向けユーザー一覧、無効化、ロール変更 API
- パスワードリセットトークン
