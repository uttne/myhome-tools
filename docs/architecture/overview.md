# システム概要

## 目的

自宅の k3s クラスター上にデプロイする Web アプリケーションを構築します。

Cloudflare Tunnel を利用し、ルーターやサーバーで外部向けポートを開放せずにインターネットへ公開します。公開経路は Cloudflare Access で保護し、アプリケーション側ではローカル認証も持つハイブリッド認証方式を採用します。

通常時は Cloudflare Access によるゼロトラスト認証を使い、LAN 内アクセスや Cloudflare 側の障害時にはアプリ独自のローカル認証で利用できる構成にします。

## 技術スタック

| コンポーネント | 本番環境 | 開発環境 | 役割 |
| --- | --- | --- | --- |
| フロントエンド | React のビルド成果物 | React + Vite | UI/UX の構築 |
| Web サーバー | NGINX | Vite dev server + proxy | 本番では静的ファイル配信、開発では HMR と API プロキシ |
| バックエンド | FastAPI | FastAPI + Uvicorn | API、認証ロジック、DB 操作 |
| データベース | 既存 PostgreSQL 上の専用 DB | PostgreSQL on Docker | メインデータストア |
| ORM / DB 管理 | SQLModel + Alembic | SQLModel + Alembic | モデル定義とマイグレーション管理 |
| 公開 / ゲートウェイ | Cloudflare Tunnel | なし | 外部からの安全なアクセス経路 |

## 関連ドキュメント

- `environments.md`: 本番環境と開発環境の構成
- `authentication.md`: 認証・認可設計
- `database.md`: DB 設計方針
- `deployment.md`: k3s / Ingress / Cloudflare Tunnel の構成
