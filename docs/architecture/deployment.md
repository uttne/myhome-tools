# デプロイ設計

## 本番デプロイ方針

本番環境では k3s クラスター上にフロントエンド、バックエンド、Cloudflare Tunnel 関連コンポーネントをデプロイします。

PostgreSQL は既存環境を利用するため、本アプリの k3s マニフェストでは PostgreSQL Pod や PVC は管理しません。

## コンポーネント

| コンポーネント | デプロイ先 | 状態 | 役割 |
| --- | --- | --- | --- |
| frontend（NGINX + 静的ファイル） | k3s | Chart 実装済み | React 配信 |
| backend（FastAPI） | k3s | Chart 実装済み | API、認証、DB 操作 |
| cloudflared | k3s | 未設定 | Cloudflare Tunnel 接続 |
| PostgreSQL | 既存環境 | 運用側管理 | アプリ専用 DB を提供 |

## Ingress ルーティング

| パス | 転送先 |
| --- | --- |
| `/api` | backend Service |
| `/healthz` | backend Service |
| `/readyz` | backend Service |
| `/` | frontend Service |

## ヘルスチェック

| エンドポイント | 用途 | レスポンス |
| --- | --- | --- |
| `/healthz` | liveness probe | `{"message": "ok"}` |
| `/readyz` | readiness probe | DB 接続確認後 `{"message": "ok"}` |

## コンテナイメージ

| イメージ | Dockerfile | 内容 |
| --- | --- | --- |
| frontend | `docker/frontend.prod.Dockerfile` | Vite build 結果を NGINX で静的配信 |
| backend | `docker/backend.prod.Dockerfile` | FastAPI を Uvicorn で起動 |

ビルドと push:

```bash
task image:publish IMAGE_REGISTRY=ghcr.io/uttne IMAGE_TAG=0.1.0
```

## Helm Chart

Kubernetes へのデプロイ定義は `charts/myhome-tools` の Helm Chart で管理します。

Chart に含まれるリソース:

- frontend Deployment / Service
- backend Deployment / Service
- Ingress
- ServiceAccount
- 任意で有効化できる Alembic migration Job（`migration.enabled`）

Secret の中身は Chart に含めません。`backend.secretEnv.databaseUrl.secretName` と `backend.secretEnv.jwtSecretKey.secretName` で既存 Secret を参照します。

インストール例:

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

Chart publish:

```bash
task helm:publish HELM_OCI_REGISTRY=oci://ghcr.io/uttne/charts
```

詳細: `charts/myhome-tools/README.md`

## ファイルストレージ（本番）

本番のバイナリ保存は家庭 k3s 管理リポジトリで構築した **JuiceFS PVC** を backend にマウントします。JuiceFS の構築・運用は本リポジトリの範囲外です。

Helm Chart の `backend.fileStorage` で既存 PVC を指定します。

```yaml
backend:
  env:
    FILE_STORAGE_ROOT: /data/files
  fileStorage:
    enabled: true
    mountPath: /data/files
    existingClaim: myhome-tools-juicefs-pvc
```

詳細: [`object-storage.md`](object-storage.md)

## 今後追加する設計

TBD:

- Cloudflare Tunnel の設定方法（k3s 管理リポジトリ）
- `cloudflared` の冗長化
- ExternalSecret manifest の配置
