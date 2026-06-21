# 環境設計

## 本番環境

本番環境では、フロントエンドとバックエンドを同一ドメイン配下に配置し、Cloudflare Access の保護対象にします。

想定アクセスフロー:

1. ユーザーが `https://app.example.com` にアクセスします。
2. Cloudflare Access が認証画面を表示します。
3. 認証成功後、Cloudflare がリクエストヘッダーにユーザー情報を付与します。
4. Cloudflare Tunnel の `cloudflared` が暗号化されたトンネル経由で k3s 内部へ転送します。
5. k3s Ingress Controller がパスベースでルーティングします。

ルーティング方針:

| パス | 転送先 | 役割 |
| --- | --- | --- |
| `/api/*` | FastAPI | API 処理と認証・認可（業務 API は `/api/v1/*`） |
| `/healthz`, `/readyz` | FastAPI | ヘルスチェック |
| `/` | NGINX（frontend イメージ） | React の静的ファイルを返す |

Helm Chart の Ingress 定義: `charts/myhome-tools/templates/ingress.yaml`

信頼境界:

- FastAPI はインターネットから直接到達できない構成にします。
- 本番の API アクセス経路は Cloudflare Access、Cloudflare Tunnel、k3s Ingress を通る経路に限定します。
- `Cf-Access-Authenticated-User-Email` は Cloudflare Access 経由で付与されるヘッダーとして扱います。
- より厳密にするため、`Cf-Access-Jwt-Assertion` の署名検証もバックエンド側で行う方針とします（未実装）。
- Ingress や Service の設定で、Cloudflare Tunnel を迂回して FastAPI に到達できる外部経路を作らないようにします。

## 開発環境

開発環境では、Docker Compose で NGINX、フロントエンド、バックエンド、PostgreSQL を起動します。

| サービス | コンテナ名 | ポート | 役割 |
| --- | --- | --- | --- |
| nginx | `myhome-tools-nginx` | `8080:80` | 開発時のブラウザ入口 |
| frontend | `myhome-tools-frontend` | 内部 `5173` | Vite dev server |
| backend | `myhome-tools-backend` | `8000:8000` | FastAPI + Uvicorn |
| db | `myhome-tools-db` | `5432:5432` | PostgreSQL 17 |

Docker Compose 利用時は、NGINX が `/api`、`/healthz`、`/readyz` を FastAPI へ、それ以外を Vite dev server へルーティングします。Vite の HMR 用 WebSocket も NGINX 経由で転送します。

`frontend` はホストに `5173` を公開していません。Docker Compose 利用時は必ず `http://localhost:8080` を開いてください。

### bind mount と volume

Compose ではリポジトリ全体を bind mount しません。ソースコードと設定ファイルだけを個別に mount し、生成物は named volume またはコンテナ内に閉じます。

| 種別 | 同期対象 | 分離先 |
| --- | --- | --- |
| frontend ソース | `src`, `*.json`, `vite.config.ts` など | `node_modules`, `dist` |
| backend ソース | `app`, `alembic`, `pyproject.toml`, `uv.lock` | Python venv, uv cache |

Windows ホストと Linux コンテナで `node_modules` や Python 仮想環境を共有しない方針です。

### 起動手順

```bash
task up
task admin:create
```

`backend` コンテナは起動時に `uv sync`、`alembic upgrade head`、Uvicorn reload を実行します。
`frontend` コンテナは起動時に `pnpm install`、`pnpm dev` を実行します。

## ローカル直接起動

Docker Compose を使わず、ホスト OS 上で backend / frontend を直接起動する開発方法もサポートします。

| コンポーネント | URL / 起動方式 |
| --- | --- |
| データベース | `docker compose up -d db` |
| バックエンド | `http://localhost:8000` / `task local:backend:dev` |
| フロントエンド | `http://localhost:5173` / `task local:frontend:dev` |

Vite の `vite.config.ts` で `/api` へのリクエストを `http://localhost:8000` に proxy し、CORS 問題を避けます。

ローカル直接起動では `backend/.venv` や `frontend/node_modules` がホスト側に作成されます。

## 開発ツール

| 用途 | ツール | 主な task |
| --- | --- | --- |
| 開発時の入口 | NGINX | `task up` |
| バックエンド | `uv` | `task backend:lint`, `task db:migrate` |
| フロントエンド | `pnpm` | `task frontend:build` |
| 検証 | task | `task check` |
| NGINX 設定 reload | nginx | `task nginx:reload` |

## 環境変数（バックエンド）

| 変数 | 説明 | 開発デフォルト |
| --- | --- | --- |
| `APP_NAME` | アプリケーション名 | `myhome-tools` |
| `DATABASE_URL` | PostgreSQL 接続 URL | Compose 内 DB |
| `FRONTEND_ORIGIN` | CORS 許可 origin | `http://localhost:8080`（Compose） |
| `JWT_SECRET_KEY` | JWT 署名鍵 | 開発用固定値 |
| `JWT_ALGORITHM` | JWT アルゴリズム | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT 有効期限（分） | `1440` |
| `AUTH_COOKIE_NAME` | 認証 Cookie 名 | `myhome_access_token` |
| `SECURE_COOKIES` | Cookie Secure フラグ | `false` |
| `FILE_STORAGE_ROOT` | ファイル保存ルート | `/workspace/data/files`（Compose） |
| `EXTERNAL_LOGOUT_URL` | 外部ログアウト URL | 空 |

設定定義: `backend/app/config.py`
