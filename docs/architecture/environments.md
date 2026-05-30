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
| `/` | NGINX コンテナ | React の静的ファイルを返す。JWT 検証は行わない |
| `/api/*` | FastAPI コンテナ | API 処理と認証・認可を行う |

信頼境界:

- FastAPI はインターネットから直接到達できない構成にします。
- 本番の API アクセス経路は Cloudflare Access、Cloudflare Tunnel、k3s Ingress を通る経路に限定します。
- `Cf-Access-Authenticated-User-Email` は Cloudflare Access 経由で付与されるヘッダーとして扱います。
- より厳密にするため、`Cf-Access-Jwt-Assertion` の署名検証もバックエンド側で行う方針とします。
- Ingress や Service の設定で、Cloudflare Tunnel を迂回して FastAPI に到達できる外部経路を作らないようにします。

## 開発環境

開発環境では、Docker Compose で NGINX、フロントエンド、バックエンド、PostgreSQL を起動します。

ローカルのソースコードと設定ファイルをコンテナの `/workspace` に bind mount し、ホスト側で編集したファイルをコンテナ内の開発サーバーへ反映します。

`node_modules`、`dist`、Python 仮想環境、依存キャッシュなどの生成物は named volume またはコンテナ内に置きます。Windows ホストと Linux コンテナで生成物を共有しないことで、OS 差分による依存関係の問題を避けます。

| コンポーネント | URL / 起動方式 |
| --- | --- |
| NGINX | `http://localhost:8080` / 開発時のブラウザ入口 |
| フロントエンド | Vite + pnpm / NGINX から `frontend:5173` へ転送 |
| バックエンド | `http://localhost:8000` / Uvicorn + uv |
| データベース | Docker Compose 上の PostgreSQL |

Docker Compose 利用時は、NGINX が `/api`、`/healthz`、`/readyz` を FastAPI へ、それ以外を Vite dev server へルーティングします。Vite の HMR 用 WebSocket も NGINX 経由で転送します。

Docker Compose を使わずにローカルで直接起動する場合は、バックエンドを `http://localhost:8000`、フロントエンドを `http://localhost:5173` で起動します。Vite の `vite.config.ts` で `/api` へのリクエストを `http://localhost:8000` に proxy し、CORS 問題を避けます。

## Docker Compose での起動手順

1. 開発環境を起動します。

   ```bash
   docker compose up --build
   ```

2. 初期管理者を作成します。

   ```bash
   docker compose exec backend sh -c "ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=password uv run python -m app.create_admin"
   ```

## 開発ツール

| 用途 | ツール |
| --- | --- |
| 開発時の入口 | NGINX |
| バックエンド依存管理・実行 | `uv` |
| フロントエンド依存管理・実行 | `pnpm` |
| ホットリロード | FastAPI reload / Vite HMR |

## ローカル直接起動

Docker Compose を使わず、ホスト OS 上で backend / frontend を直接起動する開発方法もサポートします。

この場合:

- DB は `docker compose up -d db` で起動します。
- backend は `backend/` で `uv sync`、`uv run alembic upgrade head`、`uv run uvicorn app.main:app --host 0.0.0.0 --reload` を実行します。
- frontend は `frontend/` で `pnpm install`、`pnpm dev` を実行します。
- ブラウザは `http://localhost:5173` を開きます。
- `backend/.venv` や `frontend/node_modules` はホスト側に作成されます。
