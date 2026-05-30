# myhome-tools

ホームラボ向け Web アプリケーションです。

現在は、認証だけを持つ最小ベースを実装しています。

## 構成

| ディレクトリ | 内容 |
| --- | --- |
| `backend/` | FastAPI + SQLModel + Alembic |
| `frontend/` | React + Vite |
| `docker/` | 開発用 Dockerfile |
| `docs/` | 設計・運用ドキュメント |

## 開発環境の起動

開発環境は Docker Compose で起動します。

ローカルのリポジトリをコンテナの `/workspace` に bind mount するため、ホスト側で編集したファイルはコンテナ内の FastAPI / Vite に即時反映されます。

開発ツール:

| 用途 | ツール |
| --- | --- |
| 開発時の入口 | NGINX |
| バックエンド依存管理・実行 | `uv` |
| フロントエンド依存管理・実行 | `pnpm` |
| DB | PostgreSQL |

### 1. 全サービスを起動

```bash
docker compose up --build
```

起動するサービス:

| サービス | URL |
| --- | --- |
| nginx | `http://localhost:8080` |
| backend | `http://localhost:8000` |
| db | `localhost:5432` |

Docker Compose で利用する場合は、ブラウザから `http://localhost:8080` を開きます。

NGINX が `/api`、`/healthz`、`/readyz` を backend へ、それ以外を Vite dev server へルーティングします。Vite の HMR も NGINX 経由で利用します。

`backend` コンテナは起動時に `uv sync` と `alembic upgrade head` を実行します。

`frontend` コンテナは起動時に `pnpm install` を実行します。

### 2. 初期管理者を作成

別ターミナルで実行します。

```bash
docker compose exec backend sh -c "ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=password uv run python -m app.create_admin"
```

### 3. 個別にコマンドを実行

バックエンド:

```bash
docker compose exec backend uv run ruff check .
```

フロントエンド:

```bash
docker compose exec frontend pnpm build
```

DB マイグレーション:

```bash
docker compose exec backend uv run alembic upgrade head
```

### ローカルで直接起動する場合

Docker Compose を使わずにフロントエンドを直接起動する場合は、Vite の proxy 設定により `/api` が `http://localhost:8000` に転送されます。

基本方針として、通常の開発時は Docker Compose 上の NGINX / backend / frontend コンテナを利用します。

## API

| メソッド | パス | 内容 |
| --- | --- | --- |
| `GET` | `/healthz` | プロセスの死活確認 |
| `GET` | `/readyz` | DB 接続を含む準備確認 |
| `GET` | `/api/me` | 現在のユーザーを取得 |
| `POST` | `/api/auth/login` | ローカルログイン |
| `POST` | `/api/auth/logout` | ローカルログアウト |
| `POST` | `/api/auth/password` | ローカルパスワード設定・変更 |
