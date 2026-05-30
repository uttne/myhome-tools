# 本番運用

## 方針

本番環境では、アプリケーションは k3s 上で動作します。

PostgreSQL は既存の PostgreSQL 環境を利用し、本アプリ専用に新しいデータベースを作成します。PostgreSQL 自体の運用、永続化、バックアップ、監視は既存 PostgreSQL 側の運用に委ねます。

## アプリ側で管理する項目

- k3s 上の NGINX / FastAPI / cloudflared
- Ingress / Service / Deployment
- アプリ専用 DB への接続設定
- Alembic マイグレーション
- アプリケーションログ
- readiness / liveness probe

## アプリ側で管理しない項目

- PostgreSQL Pod
- PostgreSQL 用 PVC
- PostgreSQL インスタンス自体の監視
- PostgreSQL インスタンス自体のバックアップ

## マイグレーション適用

Alembic マイグレーションは、アプリの新バージョンを反映する前に適用します。

初期構成では手動実行でもよいですが、次のルールを守ります。

- 本番適用前に既存 PostgreSQL 側のバックアップ状況を確認する。
- 開発 DB で `alembic upgrade head` を確認する。
- 破壊的変更がある場合は、データ退避または段階的マイグレーションを検討する。

## ログ

ログはまずコンテナ標準出力に出し、k3s 側で確認できるようにします。

必要になった段階で Loki、Prometheus、Grafana などのログ集約・監視基盤を検討します。

## 今後追加する運用設計

TBD:

- 本番 namespace
- デプロイ手順
- ロールバック手順
- 障害対応手順
- メンテナンス手順
