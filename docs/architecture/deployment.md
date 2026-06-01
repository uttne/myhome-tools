# デプロイ設計

## 本番デプロイ方針

本番環境では k3s クラスター上にフロントエンド、バックエンド、Cloudflare Tunnel 関連コンポーネントをデプロイします。

PostgreSQL は既存環境を利用するため、本アプリの k3s マニフェストでは PostgreSQL Pod や PVC は管理しません。

## コンポーネント

| コンポーネント | デプロイ先 | 役割 |
| --- | --- | --- |
| NGINX | k3s | React の静的ファイル配信 |
| FastAPI | k3s | API、認証、DB 操作 |
| cloudflared | k3s | Cloudflare Tunnel 接続 |
| PostgreSQL | 既存環境 | アプリ専用 DB を提供 |

## Ingress ルーティング

| パス | 転送先 |
| --- | --- |
| `/` | NGINX Service |
| `/api/*` | FastAPI Service |

## ヘルスチェック

FastAPI にはヘルスチェック用エンドポイントを用意します。

| エンドポイント | 用途 |
| --- | --- |
| `/healthz` | プロセスが起動していることを確認する liveness probe |
| `/readyz` | DB 接続など依存先を確認する readiness probe |

## コンテナイメージ

本番環境では、frontend と backend をそれぞれ独立したコンテナイメージとして配布します。

| イメージ | Dockerfile | 内容 |
| --- | --- | --- |
| frontend | `docker/frontend.prod.Dockerfile` | Vite の build 結果を NGINX で静的配信する |
| backend | `docker/backend.prod.Dockerfile` | FastAPI を Uvicorn で起動する |

レジストリは GHCR とローカル registry のどちらにも対応できるように、`Taskfile.yml` の `IMAGE_REGISTRY` と `IMAGE_TAG` で切り替えます。

GHCR へ publish する例:

```bash
task image:publish IMAGE_REGISTRY=ghcr.io/uttne IMAGE_TAG=0.1.0
```

ローカル registry へ publish する例:

```bash
task image:publish IMAGE_REGISTRY=localhost:5000 IMAGE_TAG=dev
```

Helm Chart では、これらの image repository と tag を values から指定できるようにします。

## Helm Chart

Kubernetes へのデプロイ定義は `charts/myhome-tools` の Helm Chart で管理します。

Chart のファイル構成、values の意味、Secret 参照方法は `charts/myhome-tools/README.md` に記載します。

初期構成では以下を Chart に含めます。

- frontend の Deployment / Service
- backend の Deployment / Service
- Ingress
- ServiceAccount
- 任意で有効化できる Alembic migration Job

本番固有の値は Chart 本体ではなく values で上書きします。

- image tag
- Ingress host
- Secret 名
- replica 数
- ingress class / annotations

Chart package は OCI registry として GHCR に publish できる形にします。

```bash
task helm:publish HELM_OCI_REGISTRY=oci://ghcr.io/uttne/charts
```

## 今後追加する設計

TBD:

- namespace 名
- Cloudflare Tunnel の設定方法
- `cloudflared` の冗長化
