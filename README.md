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

ローカルのソースコードと設定ファイルをコンテナの `/workspace` に bind mount するため、ホスト側で編集したファイルはコンテナ内の FastAPI / Vite に即時反映されます。

`node_modules`、`dist`、Python 仮想環境、依存キャッシュなどの生成物は named volume またはコンテナ内に置き、Windows ホストと Linux コンテナで共有しません。

開発ツール:

| 用途 | ツール |
| --- | --- |
| 開発時の入口 | NGINX |
| バックエンド依存管理・実行 | `uv` |
| フロントエンド依存管理・実行 | `pnpm` |
| DB | PostgreSQL |
| コマンド実行補助 | `task` |

利用可能なタスク一覧:

```bash
task --list
```

### 1. 全サービスを起動

```bash
task up
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
task admin:create
```

### 3. 個別にコマンドを実行

バックエンド:

```bash
task backend:lint
```

フロントエンド:

```bash
task frontend:build
```

DB マイグレーション:

```bash
task db:migrate
```

### ローカルで直接起動する場合

Docker Compose を使わずに、ホスト OS 上で frontend / backend を直接起動して開発することもできます。

この場合は、Vite の proxy 設定により `/api` が `http://localhost:8000` に転送されます。ブラウザでは `http://localhost:5173` を開きます。

DB だけ Docker Compose で起動します。

```bash
task db:up
```

バックエンド:

```bash
cd backend
copy .env.example .env
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --host 0.0.0.0 --reload
```

`task` を使う場合:

```bash
task local:backend:sync
task local:backend:migrate
task local:backend:dev
```

初期管理者を作成する場合:

```powershell
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "password"
uv run python -m app.create_admin
```

フロントエンド:

```bash
cd frontend
pnpm install
pnpm dev
```

`task` を使う場合:

```bash
task local:frontend:install
task local:frontend:dev
```

ローカル直接起動では、`backend/.venv` や `frontend/node_modules` はホスト側に作成されます。Docker Compose 起動時はこれらをコンテナ側 volume に分離しています。

基本方針として、通常の開発時は Docker Compose 上の NGINX / backend / frontend コンテナを利用できます。ホスト側のエディタ補完やデバッガを使いたい場合は、ローカル直接起動を利用してください。

## API

| メソッド | パス | 内容 |
| --- | --- | --- |
| `GET` | `/healthz` | プロセスの死活確認 |
| `GET` | `/readyz` | DB 接続を含む準備確認 |
| `GET` | `/api/me` | 現在のユーザーを取得 |
| `POST` | `/api/auth/login` | ローカルログイン |
| `POST` | `/api/auth/logout` | ローカルログアウト、必要に応じて外部ログアウト URL を返す |
| `POST` | `/api/auth/password` | ローカルパスワード設定・変更 |

## 本番用コンテナイメージ

frontend は Vite の build 結果を NGINX で配信する image、backend は FastAPI を Uvicorn で起動する image として build します。

デフォルトでは GHCR 向けの image 名になります。

```bash
task image:build IMAGE_TAG=0.1.0
task image:push IMAGE_TAG=0.1.0
```

build と push をまとめて行う場合:

```bash
task image:publish IMAGE_TAG=0.1.0
```

ローカル registry に push する場合は `IMAGE_REGISTRY` を差し替えます。

```bash
task image:publish IMAGE_REGISTRY=localhost:5000 IMAGE_TAG=dev
```

個別に image 名を指定したい場合は `FRONTEND_IMAGE` / `BACKEND_IMAGE` を指定できます。

```bash
task image:publish FRONTEND_IMAGE=localhost:5000/myhome-frontend:dev BACKEND_IMAGE=localhost:5000/myhome-backend:dev
```

## Helm Chart

本番用 Kubernetes manifest は `charts/myhome-tools` の Helm Chart で管理します。

Chart のファイル構成と values の詳細は `charts/myhome-tools/README.md` を参照してください。

Chart の静的確認:

```bash
task helm:lint
task helm:template
```

直接 install / upgrade する場合:

```bash
helm upgrade --install myhome-tools charts/myhome-tools \
  --namespace myhome-tools \
  --create-namespace \
  --set frontend.image.tag=0.1.0 \
  --set backend.image.tag=0.1.0 \
  --set ingress.host=app.example.com \
  --set backend.secretEnv.databaseUrl.secretName=myhome-tools-db \
  --set backend.secretEnv.jwtSecretKey.secretName=myhome-tools-auth
```

OCI registry に Chart package を push する場合:

```bash
task helm:publish
```

デフォルトでは `oci://ghcr.io/uttne/charts` へ push します。変更する場合は `HELM_OCI_REGISTRY` を指定します。

```bash
task helm:publish HELM_OCI_REGISTRY=oci://ghcr.io/uttne/charts
```

Chart に変更がある場合は、OCI registry 上の最新 version の patch を 1 つ上げた version で push できます。

```bash
task helm:publish:next-patch HELM_OCI_REGISTRY=oci://ghcr.io/uttne/charts
```

リモート最新 version と chart-testing による変更検出は個別に確認できます。

```bash
task helm:version:remote HELM_OCI_REGISTRY=oci://ghcr.io/uttne/charts
task helm:ct:list-changed
task helm:ct:lint
```

chart-testing は Docker image `quay.io/helmpack/chart-testing` で実行します。`CT_TARGET_BRANCH` で比較先 branch、`CT_IMAGE` で使用する image tag を変更できます。この task は `Chart.yaml` を書き換えず、package 作成時に `helm package --version` で自動採番した version を指定します。
