# 認証・認可設計

## 概要

本システムでは、Cloudflare Access による外部公開時の認証と、アプリケーション独自のローカル認証を併用します。

Cloudflare Access 経由かローカル JWT 経由かは本人確認の方法であり、アプリ内権限とは分離します。アプリ内の認可は `role` で判断します。

**メールアドレスの許可制限はアプリの責務としません。** 入口制御は Cloudflare Access ポリシーに任せ、将来 `Cf-Access-Jwt-Assertion` の検証で信頼境界を強化します。

## 実装状態

| 機能 | 状態 | 実装 |
| --- | --- | --- |
| Cloudflare Access ヘッダー認証 | 実装済み | `Cf-Access-Authenticated-User-Email` |
| Cloudflare JIT プロビジョニング | 実装済み | ヘッダーありかつ未登録なら `user` ロールで作成 |
| ローカル JWT Cookie 認証 | 実装済み | Cookie 名 `myhome_access_token` |
| ローカルログイン / ログアウト | 実装済み | `/api/v1/auth/login`, `/api/v1/auth/logout` |
| パスワード設定・変更 | 実装済み | `/api/v1/auth/password` |
| 初期管理者 CLI | 実装済み | `python -m app.create_admin` |
| `Cf-Access-Jwt-Assertion` 署名検証 | 未実装 | フェーズ3で追加予定 |
| 管理者向けユーザー管理 API | 未実装 | 将来追加予定 |

## FastAPI の認証優先順位

API リクエストを受け取った FastAPI は、次の順序でユーザーを特定します。

1. Cloudflare Access 認証
   - `Cf-Access-Authenticated-User-Email` ヘッダーを確認します。
   - 既存ユーザーを返すか、未登録なら JIT プロビジョニングで `user` ロールを作成します。
   - `is_active = false` のユーザーは拒否します。
2. ローカル JWT 認証
   - Cloudflare ヘッダーが存在しない場合、Cookie `myhome_access_token` の JWT を検証します。
   - 主に LAN 内アクセス、開発環境、Cloudflare 側障害時のフォールバックとして利用します。
3. 未認証
   - どちらの認証情報も存在しない、または無効な場合は `401 Unauthorized` を返します。

実装: `backend/app/auth.py` の `get_current_user`

## JIT プロビジョニング

Cloudflare Access 経由で未登録ユーザーがアクセスした場合、次の条件でユーザーを自動作成します。

- `Cf-Access-Authenticated-User-Email` が存在すること。
- 初期ロールは `user` に固定すること。
- 管理者ロールは JIT プロビジョニングでは付与しないこと。
- 同時に個人グループを作成すること（[`../application/features/groups.md`](../application/features/groups.md)）。

入口のメール制限は Cloudflare Access 側で行います。アプリはヘッダーを信頼する前提です（JWT 検証は将来追加）。

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

### CSRF（フェーズ1）

Cookie 認証の状態変更 API では、フェーズ1は **`SameSite=Lax` のみ** とします。CSRF トークンや再認証の追加は管理者 API 導入時に検討します。

## 認可方針

| ロール | 想定権限 |
| --- | --- |
| `admin` | ユーザー管理、共有グループ作成、設定変更、全データ操作 |
| `user` | 通常機能の利用 |

現時点では API ごとのロールチェックは未実装です。管理者向け API 追加時に `admin` ロールを要求する dependency を追加します。

## ユーザー管理

初期管理者は JIT プロビジョニングではなく CLI で作成します。

```bash
task admin:create ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=password
```

家族ユーザーの追加方法:

1. Cloudflare Access ポリシーで対象ユーザーを許可します。
2. 対象ユーザーが Cloudflare Access 経由で初回ログインします。
3. JIT プロビジョニングで一般ユーザーと個人グループが作成されます。
4. 共有グループへの参加は管理者が手動で行います（フェーズ1）。
5. LAN 内でも利用する場合、ログイン済み状態で `/api/v1/auth/password` によりローカルパスワードを設定します。

パスワード設定・リセット:

- `password_hash = NULL` のユーザーはローカルログインできません。
- 本人が Cloudflare Access 経由でログイン済みの場合、自分のローカルパスワードを設定できます。
- 初回設定時は `current_password` を省略できます。既存パスワードがある場合は `current_password` が必須です。
- 画面は `/settings/password`（フェーズ1で追加）。

## フロントエンドの認証判定

アプリ初期ロード時に FastAPI の `/api/v1/me` を呼び出し、認証状態を判定します。

| `/api/v1/me` の結果 | フロントエンドの挙動 |
| --- | --- |
| `200 OK` | ログイン済みとして `/home` へ（または AppShell 表示） |
| `401 Unauthorized` | ローカルログイン画面を表示 |
| その他 | エラーメッセージ |

認証済みの `/` は `/home` へリダイレクトします。

ログアウトは `/logout` ページで `/api/v1/auth/logout` を呼び出し、`logout_url` があれば外部認証基盤へリダイレクトします。

## 将来追加予定

- `Cf-Access-Jwt-Assertion` の署名、audience、有効期限検証（フェーズ3）
- 管理者向けユーザー一覧、無効化、ロール変更 API
- パスワードリセットトークン
