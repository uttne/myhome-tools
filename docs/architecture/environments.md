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

開発環境では、データベースのみをコンテナ化し、フロントエンドとバックエンドはローカル PC 上で直接起動します。

| コンポーネント | URL / 起動方式 |
| --- | --- |
| フロントエンド | `http://localhost:5173` / Vite |
| バックエンド | `http://localhost:8000` / Uvicorn |
| データベース | Docker Compose 上の PostgreSQL |

Vite の `vite.config.ts` で `/api` へのリクエストを `http://localhost:8000` に proxy し、開発時の CORS 問題を避けます。

## ローカル起動手順

1. PostgreSQL を起動します。

   ```bash
   docker compose up -d db
   ```

2. Alembic でマイグレーションを適用します。

   ```bash
   alembic upgrade head
   ```

3. FastAPI を起動します。

   ```bash
   uvicorn app.main:app --reload
   ```

4. React/Vite を起動します。

   ```bash
   npm run dev
   ```

## 開発環境の追加検討

現在の方針では開発環境はローカル実行、本番は k3s 実行です。開発体験は良い一方で、環境差分による問題が出る可能性があります。

必要に応じて、バックエンドも Docker Compose で起動できる補助設定を用意しておくと、本番に近い形で再現確認できます。
