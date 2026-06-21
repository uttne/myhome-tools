# 本番運用

## 方針

本番環境では、アプリケーションは k3s 上で動作します。

PostgreSQL は既存の PostgreSQL 環境を利用し、本アプリ専用に新しいデータベースを作成します。PostgreSQL 自体の運用、永続化、バックアップ、監視は既存 PostgreSQL 側の運用に委ねます。

## アプリ側で管理する項目

- k3s 上の frontend（NGINX + 静的ファイル）/ backend（FastAPI）
- Helm Chart による Deployment / Service / Ingress
- cloudflared（Cloudflare Tunnel、未設定）
- アプリ専用 DB への接続設定（Kubernetes Secret 参照）
- Alembic マイグレーション
- アプリケーションログ
- readiness / liveness probe（`/readyz`, `/healthz`）

## アプリ側で管理しない項目

- PostgreSQL Pod
- PostgreSQL 用 PVC
- PostgreSQL インスタンス自体の監視
- PostgreSQL インスタンス自体のバックアップ

## デプロイ

Helm Chart: `charts/myhome-tools`

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

イメージの build / push:

```bash
task image:publish IMAGE_TAG=0.1.0
```

## マイグレーション適用

Alembic マイグレーションは、アプリの新バージョンを反映する前に適用します。

Helm Chart では `migration.enabled=true` で pre-install / pre-upgrade hook として Job を実行できます。

手動実行の場合:

```bash
# 開発環境での確認
task db:migrate
```

本番適用前のルール:

- 既存 PostgreSQL 側のバックアップ状況を確認する。
- 開発 DB で `alembic upgrade head` を確認する。
- 破壊的変更がある場合は、データ退避または段階的マイグレーションを検討する。

## ログ

ログはコンテナ標準出力に出し、k3s 側で確認できるようにします。

必要になった段階で Loki、Prometheus、Grafana などのログ集約・監視基盤を検討します。

## 今後追加する運用設計

TBD:

- 本番 namespace の確定
- ロールバック手順
- 障害対応手順
- メンテナンス手順
