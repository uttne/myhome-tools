# myhome-tools Helm Chart

この Chart は `myhome-tools` を Kubernetes / k3s にデプロイするための Helm Chart です。

frontend は Vite の build 結果を NGINX で配信し、backend は FastAPI を Uvicorn で起動します。PostgreSQL は Chart では作成せず、既存 DB の接続情報を Kubernetes Secret 経由で backend に渡します。

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `Chart.yaml` | Chart の名前、version、appVersion などの metadata を定義します。 |
| `values.yaml` | デフォルト設定値です。本番環境では別 values file や `--set` で上書きします。 |
| `.helmignore` | `helm package` に含めないファイルを定義します。 |
| `templates/_helpers.tpl` | resource 名、共通 labels、ServiceAccount 名、backend env などの共通 template helper です。 |
| `templates/serviceaccount.yaml` | frontend / backend / migration Job が使う ServiceAccount を作成します。 |
| `templates/frontend-deployment.yaml` | frontend の Deployment を作成します。 |
| `templates/frontend-service.yaml` | frontend の Service を作成します。 |
| `templates/backend-deployment.yaml` | backend の Deployment を作成します。 |
| `templates/backend-service.yaml` | backend の Service を作成します。 |
| `templates/ingress.yaml` | `/api`、`/healthz`、`/readyz` を backend、それ以外を frontend へルーティングする Ingress を作成します。 |
| `templates/migration-job.yaml` | 任意で Alembic migration Job を Helm hook として作成します。 |

## 主要パラメータ

### 共通

| パラメータ | デフォルト | 意味 |
| --- | --- | --- |
| `nameOverride` | `""` | resource 名の base name を上書きします。通常は空で問題ありません。 |
| `fullnameOverride` | `""` | resource 名全体を上書きします。命名を完全に固定したい場合に使います。 |
| `imagePullSecrets` | `[]` | private registry から image を pull するための Secret 名を指定します。private GHCR image を使う場合に必要です。 |

### ServiceAccount

| パラメータ | デフォルト | 意味 |
| --- | --- | --- |
| `serviceAccount.create` | `true` | Chart で ServiceAccount を作成するかどうかです。 |
| `serviceAccount.name` | `""` | ServiceAccount 名です。空の場合は Chart の fullname を使います。 |
| `serviceAccount.annotations` | `{}` | ServiceAccount に追加する annotations です。 |

### Frontend

| パラメータ | デフォルト | 意味 |
| --- | --- | --- |
| `frontend.replicaCount` | `1` | frontend Pod の replica 数です。 |
| `frontend.image.repository` | `ghcr.io/uttne/myhome-tools-frontend` | frontend image repository です。 |
| `frontend.image.tag` | `latest` | frontend image tag です。本番では固定 version を推奨します。 |
| `frontend.image.pullPolicy` | `IfNotPresent` | image pull policy です。 |
| `frontend.service.type` | `ClusterIP` | frontend Service の type です。通常は Ingress 経由なので `ClusterIP` のままにします。 |
| `frontend.service.port` | `80` | frontend Service の port です。 |
| `frontend.podAnnotations` | `{}` | frontend Pod に追加する annotations です。 |
| `frontend.resources` | `{}` | frontend container の requests / limits です。 |
| `frontend.nodeSelector` | `{}` | frontend Pod の nodeSelector です。 |
| `frontend.tolerations` | `[]` | frontend Pod の tolerations です。 |
| `frontend.affinity` | `{}` | frontend Pod の affinity です。 |

### Backend

| パラメータ | デフォルト | 意味 |
| --- | --- | --- |
| `backend.replicaCount` | `1` | backend Pod の replica 数です。 |
| `backend.image.repository` | `ghcr.io/uttne/myhome-tools-backend` | backend image repository です。 |
| `backend.image.tag` | `latest` | backend image tag です。本番では固定 version を推奨します。 |
| `backend.image.pullPolicy` | `IfNotPresent` | image pull policy です。 |
| `backend.service.type` | `ClusterIP` | backend Service の type です。通常は Ingress 経由なので `ClusterIP` のままにします。 |
| `backend.service.port` | `8000` | backend Service の port です。 |
| `backend.env.APP_NAME` | `myhome-tools` | FastAPI のアプリ名です。 |
| `backend.env.FRONTEND_ORIGIN` | `https://app.example.com` | CORS の許可 origin です。本番 URL に合わせます。 |
| `backend.env.JWT_ALGORITHM` | `HS256` | JWT 署名アルゴリズムです。 |
| `backend.env.ACCESS_TOKEN_EXPIRE_MINUTES` | `"1440"` | ローカル JWT Cookie の有効期限です。 |
| `backend.env.AUTH_COOKIE_NAME` | `myhome_access_token` | ローカル JWT Cookie 名です。 |
| `backend.env.SECURE_COOKIES` | `"true"` | Cookie に Secure 属性を付けるかどうかです。本番 HTTPS では `true` を使います。 |
| `backend.env.ALLOWED_CLOUDFLARE_EMAILS` | `""` | Cloudflare Access email の許可リストです。カンマ区切りで指定します。空の場合は制限しません。 |
| `backend.env.EXTERNAL_LOGOUT_URL` | `""` | 外部認証基盤側のログアウト URL です。空の場合はローカルログアウトだけを行います。 |
| `backend.secretEnv.databaseUrl.secretName` | `""` | `DATABASE_URL` を持つ既存 Secret 名です。空の場合は `DATABASE_URL` env を出力しません。 |
| `backend.secretEnv.databaseUrl.secretKey` | `DATABASE_URL` | DB URL を格納している Secret key です。 |
| `backend.secretEnv.jwtSecretKey.secretName` | `""` | `JWT_SECRET_KEY` を持つ既存 Secret 名です。空の場合は `JWT_SECRET_KEY` env を出力しません。 |
| `backend.secretEnv.jwtSecretKey.secretKey` | `JWT_SECRET_KEY` | JWT secret を格納している Secret key です。 |
| `backend.extraEnv` | `[]` | 追加の Kubernetes EnvVar をそのまま渡します。 |
| `backend.podAnnotations` | `{}` | backend Pod に追加する annotations です。 |
| `backend.resources` | `{}` | backend container の requests / limits です。 |
| `backend.nodeSelector` | `{}` | backend Pod の nodeSelector です。 |
| `backend.tolerations` | `[]` | backend Pod の tolerations です。 |
| `backend.affinity` | `{}` | backend Pod の affinity です。 |

### Ingress

| パラメータ | デフォルト | 意味 |
| --- | --- | --- |
| `ingress.enabled` | `true` | Ingress を作成するかどうかです。 |
| `ingress.className` | `""` | IngressClass 名です。空の場合は cluster の default に任せます。 |
| `ingress.annotations` | `{}` | Ingress controller や cert-manager 用の annotations です。 |
| `ingress.host` | `app.example.com` | 公開 hostname です。 |
| `ingress.tls` | `[]` | Kubernetes Ingress の TLS 設定です。 |

Ingress の path は固定です。

| Path | 転送先 |
| --- | --- |
| `/api` | backend Service |
| `/healthz` | backend Service |
| `/readyz` | backend Service |
| `/` | frontend Service |

### Migration

| パラメータ | デフォルト | 意味 |
| --- | --- | --- |
| `migration.enabled` | `false` | Alembic migration Job を Helm hook として実行するかどうかです。 |
| `migration.backoffLimit` | `1` | migration Job の retry 回数です。 |
| `migration.annotations` | `pre-install,pre-upgrade` hook | migration Job に付与する annotations です。 |

`migration.enabled=true` にすると、backend image を使って `alembic upgrade head` を実行します。本番では DB バックアップ状況を確認してから有効化してください。

## Secret

この Chart は Secret の中身を作成しません。DB URL と JWT secret は既存 Secret を参照します。

例:

```bash
kubectl create secret generic myhome-tools-db \
  --namespace myhome-tools \
  --from-literal=DATABASE_URL='postgresql+psycopg://user:password@postgres.example.com:5432/myhome_tools'

kubectl create secret generic myhome-tools-auth \
  --namespace myhome-tools \
  --from-literal=JWT_SECRET_KEY='change-me'
```

Chart では次のように参照します。

```yaml
backend:
  secretEnv:
    databaseUrl:
      secretName: myhome-tools-db
      secretKey: DATABASE_URL
    jwtSecretKey:
      secretName: myhome-tools-auth
      secretKey: JWT_SECRET_KEY
```

## Install

ローカルの Chart directory を直接使う例です。

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

本番では `--set` を多用せず、別 repo や環境ごとの `values-prod.yaml` にまとめることを推奨します。

## Package And Publish

Chart の検証:

```bash
task helm:lint
task helm:template
```

Chart package 作成:

```bash
task helm:package
```

GHCR の OCI registry へ push:

```bash
task helm:publish HELM_OCI_REGISTRY=oci://ghcr.io/uttne/charts
```

Chart package の version は `Chart.yaml` の `version` から決まります。同じ version の中身を上書きすると追跡や rollback が難しくなるため、本番で使う version は変更ごとに上げることを推奨します。
