# AGENTS.md

このファイルは、次回以降の AI エージェントや開発者が `myhome-tools` の作業を継続するための引き継ぎメモです。

## プロジェクト概要

`myhome-tools` はホームラボ向け Web アプリケーションです。

現時点では、認証以外の業務機能を持たない最小ベースを実装しています。主な目的は、今後の機能追加に備えて以下を整えることです。

- Docker Compose ベースの開発環境
- FastAPI バックエンド
- React + Vite フロントエンド
- PostgreSQL
- Alembic マイグレーション
- ローカル JWT Cookie 認証
- Cloudflare Access 連携を見据えたユーザーモデル
- NGINX 経由の開発時ルーティング

## 現在の構成

```text
.
├── backend/                # FastAPI + SQLModel + Alembic
├── frontend/               # React + Vite
├── docker/                 # 開発用 Dockerfile / NGINX 設定
├── docs/                   # 設計・運用ドキュメント
├── docker-compose.yml      # 開発環境
├── README.md               # 起動手順
└── AGENTS.md               # このファイル
```

## 使用ツール

| 領域 | ツール | 備考 |
| --- | --- | --- |
| 開発環境 | Docker Compose | 標準の開発方法 |
| 開発時入口 | NGINX | `http://localhost:8080` |
| バックエンド | FastAPI | `backend/app/main.py` |
| バックエンド依存管理 | `uv` | コンテナ内で実行 |
| ORM | SQLModel | `backend/app/models.py` |
| DB マイグレーション | Alembic | `backend/alembic/` |
| DB | PostgreSQL | 開発では Compose の `db` |
| フロントエンド | React + Vite | `frontend/` |
| フロントエンド依存管理 | `pnpm` | コンテナ内で実行 |
| Lint | Ruff | バックエンド |

## 開発環境の起動

標準の起動方法:

```bash
docker compose up --build
```

ブラウザで開く URL:

```text
http://localhost:8080
```

サービス:

- `nginx`: 開発時のブラウザ入口。`8080:80`
- `frontend`: Vite dev server。コンテナ内 `frontend:5173`
- `backend`: FastAPI。コンテナ内 `backend:8000`
- `db`: PostgreSQL。コンテナ内 `db:5432`

`frontend` はホストに `5173` を公開していません。Docker Compose 利用時は必ず `http://localhost:8080` を開いてください。

Compose ではリポジトリ全体を bind mount しません。ソースコードと設定ファイルだけを個別に mount し、生成物は named volume またはコンテナ内に閉じます。

- `frontend/src`, `frontend/*.json`, `frontend/vite.config.ts` などは同期する。
- `frontend/node_modules` は `frontend-node-modules` volume。
- `frontend/dist` は `frontend-dist` volume。
- `backend/app`, `backend/alembic`, `backend/pyproject.toml`, `backend/uv.lock` などは同期する。
- Python 仮想環境は `backend-venv` volume。
- `uv` cache は `backend-uv-cache` volume。
- `pnpm` store は `pnpm-store` volume。

Windows ホストと Linux コンテナで `node_modules` や Python 仮想環境を共有しない方針です。

## ローカル直接起動での開発

Docker Compose を使わず、ホスト OS 上で frontend / backend を直接起動して開発する方法もサポートしています。

この場合は DB だけ Compose で起動します。

```bash
docker compose up -d db
```

バックエンド:

```bash
cd backend
copy .env.example .env
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --host 0.0.0.0 --reload
```

PowerShell で初期管理者を作成する場合:

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

ローカル直接起動時のブラウザ URL:

```text
http://localhost:5173
```

ローカル直接起動では `backend/.venv` や `frontend/node_modules` がホスト側に作成されます。Docker Compose 起動時はこれらを named volume に分離しています。

Vite proxy はローカル直接起動のために残しています。`frontend/vite.config.ts` の `/api` proxy は `http://localhost:8000` を向いています。

## 開発時のルーティング

Docker Compose 利用時:

- ブラウザ → `localhost:8080` → NGINX
- `/api`, `/healthz`, `/readyz` → `backend:8000`
- それ以外 → `frontend:5173`

NGINX 設定:

```text
docker/nginx.dev.conf
```

Vite proxy:

```text
frontend/vite.config.ts
```

Vite proxy は Docker Compose を使わず、フロントエンドを直接起動する場合のために残しています。Docker Compose 利用時は NGINX が前段でルーティングします。

## よくある注意点

### NGINX 設定を変更した場合

`docker/nginx.dev.conf` は bind mount されていますが、NGINX は自動 reload しません。設定を変更したら以下を実行してください。

```bash
docker compose exec nginx nginx -s reload
```

または NGINX コンテナを作り直します。

```bash
docker compose up -d --force-recreate nginx
```

確認:

```bash
docker compose config
docker compose exec nginx nginx -t
```

### NGINX と Vite の Host ヘッダー

Vite は `frontend:5173` へ直接 `Host: frontend:5173` でアクセスすると `403 Forbidden` を返すことがあります。

NGINX 経由では `Host: localhost:8080` のまま Vite に渡すため、`http://localhost:8080` では問題ありません。

### bcrypt / passlib

`passlib 1.7.4` は `bcrypt 5.x` と相性問題があります。

`backend/pyproject.toml` では以下を明示固定しています。

```toml
bcrypt==4.0.1
```

この固定を外すと、管理者作成時の `hash_password()` で失敗する可能性があります。

## 初期管理者の作成

```bash
docker compose exec backend sh -c "ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=password uv run python -m app.create_admin"
```

既にユーザーが存在する場合は再作成しません。

## 主要確認コマンド

Compose 設定確認:

```bash
docker compose config
```

サービス状態:

```bash
docker compose ps
```

NGINX 設定確認:

```bash
docker compose exec nginx nginx -t
```

バックエンド lint:

```bash
docker compose run --rm --no-deps backend uv run ruff check .
```

フロントエンド build:

```bash
docker compose run --rm --no-deps frontend pnpm build
```

バックエンド依存同期:

```bash
docker compose exec backend uv sync
```

DB マイグレーション:

```bash
docker compose exec backend uv run alembic upgrade head
```

疎通確認:

```bash
# 期待値: 200
curl http://localhost:8080

# 未ログイン時の期待値: 401
curl http://localhost:8080/api/me
```

PowerShell では `Invoke-WebRequest` を使ってもよいです。

## バックエンド実装メモ

主要ファイル:

- `backend/app/main.py`: FastAPI app、API ルーティング
- `backend/app/auth.py`: 認証、Cookie、ユーザー取得、JIT プロビジョニング
- `backend/app/security.py`: JWT、パスワードハッシュ
- `backend/app/models.py`: SQLModel モデル
- `backend/app/schemas.py`: API スキーマ
- `backend/app/db.py`: DB engine / session
- `backend/app/config.py`: 環境変数設定
- `backend/app/create_admin.py`: 初期管理者作成
- `backend/alembic/versions/0001_create_users.py`: 初期 users テーブル

現時点の API:

- `GET /healthz`
- `GET /readyz`
- `GET /api/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/password`

認証方針:

- Cloudflare Access ヘッダーがあれば優先
- なければローカル JWT Cookie を確認
- ローカル JWT Cookie 名は `myhome_access_token`
- 開発環境では `SECURE_COOKIES=false`

## フロントエンド実装メモ

主要ファイル:

- `frontend/src/App.tsx`: 最小ログイン UI、`/api/me` 判定
- `frontend/src/main.tsx`: React entrypoint
- `frontend/src/styles.css`: 最小スタイル
- `frontend/vite.config.ts`: Vite 設定。非 Docker 開発用の `/api` proxy あり

現時点では画面は最小構成です。

- 未認証: ローカルログインフォーム
- 認証済み: email / role / provider とログアウトボタン

## ドキュメントの場所

まず読む:

- `README.md`: 起動手順
- `docs/README.md`: ドキュメント全体の目次
- `docs/architecture/overview.md`: システム概要
- `docs/architecture/environments.md`: 本番・開発環境
- `docs/architecture/authentication.md`: 認証・認可
- `docs/architecture/database.md`: DB 設計
- `docs/architecture/deployment.md`: デプロイ設計
- `docs/operations/production.md`: 本番運用
- `docs/operations/secrets.md`: Secret 管理
- `docs/operations/backup-restore.md`: バックアップ・復旧
- `docs/application/api.md`: API 設計
- `docs/application/screens.md`: 画面設計
- `docs/application/domain-model.md`: ドメインモデル
- `docs/application/requirements.md`: アプリ要件
- `docs/open-questions.md`: 未決事項
- `docs/roadmap.md`: 今後の実装予定

重要な設計判断:

- `docs/decisions/ADR-0001-cloudflare-access-and-local-auth.md`

## ドキュメント更新ルール

- 決定済みの設計は `docs/architecture/` または `docs/operations/` に記載します。
- アプリの機能仕様は `docs/application/` に記載します。
- 未決事項は `docs/open-questions.md` に集約します。
- 大きな設計判断は `docs/decisions/` に ADR として残します。
- まだ決まっていない項目は `TBD` と明記します。

## Git / コミット

- ユーザーから明示的に依頼されるまでコミットしません。
- 直近のコミットメッセージは日本語の短い要約です。
- 例:
  - `ドキュメント構成を整理`
  - `認証のみのアプリ基盤を追加`

## 実装時の方針

- まず Docker Compose 環境を基準に動作確認します。
- Docker Compose を使わない開発も視野に入れ、Vite proxy は残します。
- 本番 PostgreSQL は既存環境を利用する前提です。k3s 内に本番 PostgreSQL Pod は作りません。
- Secret の原本は GCP Secret Manager、k3s では ESO 経由で Kubernetes Secret に同期する前提です。
- 認証方式とアプリ内認可は分離します。権限は `role` で判断します。
- Cloudflare Access のヘッダーだけでなく、将来的には `Cf-Access-Jwt-Assertion` の検証も考慮します。
