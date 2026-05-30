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

ローカルのリポジトリをコンテナの `/workspace` に bind mount し、ホスト側で編集したファイルをコンテナ内の開発サーバーへ反映します。

| コンポーネント | URL / 起動方式 |
| --- | --- |
| NGINX | `http://localhost:8080` / 開発時のブラウザ入口 |
| フロントエンド | Vite + pnpm / NGINX から `frontend:5173` へ転送 |
| バックエンド | `http://localhost:8000` / Uvicorn + uv |
| データベース | Docker Compose 上の PostgreSQL |

Docker Compose 利用時は、NGINX が `/api`、`/healthz`、`/readyz` を FastAPI へ、それ以外を Vite dev server へルーティングします。Vite の HMR 用 WebSocket も NGINX 経由で転送します。

Docker Compose を使わずにローカルで直接起動する場合は、Vite の `vite.config.ts` で `/api` へのリクエストを `http://localhost:8000` に proxy し、CORS 問題を避けます。

## 開発環境の起動手順

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
