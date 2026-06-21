# システム概要

## 目的

自宅の k3s クラスター上にデプロイする Web アプリケーションを構築します。

Cloudflare Tunnel を利用し、ルーターやサーバーで外部向けポートを開放せずにインターネットへ公開します。公開経路は Cloudflare Access で保護し、アプリケーション側ではローカル認証も持つハイブリッド認証方式を採用します。

通常時は Cloudflare Access によるゼロトラスト認証を使い、LAN 内アクセスや Cloudflare 側の障害時にはアプリ独自のローカル認証で利用できる構成にします。

## 現在の実装状態

現時点では、認証のみを持つ最小ベースが実装されています。

| レイヤ | 実装内容 |
| --- | --- |
| バックエンド | FastAPI、User モデル、認証 API、ヘルスチェック |
| フロントエンド | React + Vite、ローカルログイン、ログアウト、認証状態表示 |
| 開発環境 | Docker Compose（NGINX + frontend + backend + db） |
| 本番準備 | 本番用 Docker イメージ、Helm Chart |

業務機能はこれから追加します。アプリ設計の全体像は `application/design.md` を参照してください。

## 技術スタック

| コンポーネント | 本番環境 | 開発環境 | 役割 |
| --- | --- | --- | --- |
| フロントエンド | React のビルド成果物 | React + Vite | UI/UX の構築 |
| Web サーバー | NGINX | NGINX + Vite dev server | 静的ファイル配信、開発時 HMR |
| バックエンド | FastAPI | FastAPI + Uvicorn | API、認証ロジック、DB 操作 |
| データベース | 既存 PostgreSQL 上の専用 DB | PostgreSQL 17 on Docker | メインデータストア |
| ORM / DB 管理 | SQLModel + Alembic | SQLModel + Alembic | モデル定義とマイグレーション管理 |
| 公開 / ゲートウェイ | Cloudflare Tunnel | なし | 外部からの安全なアクセス経路 |
| 依存管理 | — | uv（backend）、pnpm（frontend） | 開発・ビルド |
| コマンド補助 | — | Taskfile | よく使うコマンドの集約 |

## リポジトリ構成

```text
.
├── backend/          # FastAPI + SQLModel + Alembic
├── frontend/         # React + Vite
├── docker/           # Dockerfile / NGINX 設定
├── charts/           # Helm Chart
├── docs/             # 設計・運用ドキュメント
├── docker-compose.yml
├── Taskfile.yml
└── README.md
```

## 関連ドキュメント

| ドキュメント | 内容 |
| --- | --- |
| `environments.md` | 本番環境と開発環境の構成 |
| `authentication.md` | 認証・認可設計 |
| `database.md` | DB 設計 |
| `deployment.md` | k3s / Ingress / Helm Chart |
| `../application/design.md` | アプリケーション設計 |
| `../roadmap.md` | 実装予定 |
