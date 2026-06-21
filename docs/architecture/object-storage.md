# ファイルストレージ設計

## 方針

画像などのバイナリデータは PostgreSQL に本体を保存しません。

アプリは **POSIX 互換のファイルパス**で読み書きします。ストレージの実体（ローカルディレクトリか JuiceFS PVC）は環境変数 `FILE_STORAGE_ROOT` で切り替えます。PostgreSQL にはパス、MIME、サイズ、参照元などのメタデータのみを保持します。

## 責務の分離

| 領域 | 管理場所 | 本リポジトリの責務 |
| --- | --- | --- |
| アプリのファイル I/O | `myhome-tools` | **あり**（`FILE_STORAGE_ROOT` 配下へ読み書き） |
| JuiceFS の構築（CSI、メタ DB、オブジェクト層） | 家庭 k3s 管理リポジトリ | **なし**（PVC が既に存在する前提） |
| 開発用ローカルファイル | `myhome-tools` | **あり**（通常のディレクトリを使用） |

本番では家庭 k3s 管理リポジトリ側で JuiceFS PVC を用意し、backend Pod にマウントします。アプリはマウント先パスを `FILE_STORAGE_ROOT` に設定するだけです。

## アーキテクチャ

```text
ブラウザ
  → FastAPI（アップロード受付・認可）
    → FILE_STORAGE_ROOT 配下へ書き込み（例: .../shopping/masters/...）
  → PostgreSQL（stored_objects メタデータ、エンティティ参照）

ブラウザ（表示時）
  → FastAPI（/api/v1/files/{id} 等でプロキシ）
    → FILE_STORAGE_ROOT から読み出し
```

ブラウザからストレージへ直接アクセスしません。

### パス設計（初期）

`FILE_STORAGE_ROOT` からの相対パスを `stored_objects.storage_path` に保存します。

```text
{FILE_STORAGE_ROOT}/shopping/masters/{master_id}/{uuid}.{ext}
```

DB 保存例: `shopping/masters/{master_id}/{uuid}.webp`

## 環境別構成

### 開発

JuiceFS は使いません。ホストまたはコンテナ内の**通常のローカルディレクトリ**を使います。

| 環境 | `FILE_STORAGE_ROOT` 例 | 備考 |
| --- | --- | --- |
| Docker Compose | `/workspace/data/files` | `./data/files` を bind mount |
| ローカル直接起動 | `./data/files` | リポジトリ直下に作成 |

`docker-compose.yml` では `./data/files` を backend にマウントし、`FILE_STORAGE_ROOT` を設定します。

### 本番（k3s）

JuiceFS PVC は家庭 k3s 管理リポジトリで構築済みとし、Helm Chart で既存 PVC を backend にマウントします。

```text
backend Pod
  └── volumeMount: /data/files（JuiceFS PVC、管理リポジトリ側で作成）
      └── FILE_STORAGE_ROOT=/data/files
```

JuiceFS のメタデータ DB、オブジェクト層、CSI Driver の詳細は本リポジトリでは決めません。

## 環境変数

| 変数 | 説明 | 開発例 | 本番例 |
| --- | --- | --- | --- |
| `FILE_STORAGE_ROOT` | ファイル保存のルートディレクトリ | `/workspace/data/files` | `/data/files` |

アプリが参照するのはこの変数のみです。JuiceFS 固有の設定（メタ DB URL、バケット名など）はアプリに渡しません。

## Helm Chart（本番）

`charts/myhome-tools/values.yaml` の `backend.fileStorage` で既存 PVC をマウントします。

```yaml
backend:
  env:
    FILE_STORAGE_ROOT: /data/files
  fileStorage:
    enabled: true
    mountPath: /data/files
    existingClaim: myhome-tools-juicefs-pvc  # k3s 管理リポジトリで作成した PVC 名（仮）
```

PVC の作成・JuiceFS の運用は家庭 k3s 管理リポジトリ側の責務です。PVC 名の仮値は `myhome-tools-juicefs-pvc` です（`charts/myhome-tools/values.yaml` の `backend.fileStorage.existingClaim` と一致）。

## アップロードフロー

1. クライアントが multipart で画像を POST
2. FastAPI が認可・バリデーション（サイズ、MIME）
3. FastAPI が `FILE_STORAGE_ROOT` 配下にファイルを書き込み
4. PostgreSQL に `stored_objects` レコードを作成
5. エンティティ（例: `shopping_item_masters.image_object_id`）が参照

### 画像制約（初期）

| 項目 | 値 |
| --- | --- |
| 最大サイズ | 5 MB |
| 許可 MIME | `image/jpeg`, `image/png`, `image/webp` |
| リサイズ | 初期はなし |

## 参照・削除

- **参照**: `GET /api/v1/files/{id}` — 認証済み `user` / `admin` なら取得可（フェーズ1はグループ所属チェックなし。家族内共有前提）
- **削除**: マスター削除時にファイル + `stored_objects` を削除。孤立ファイルの GC は将来検討

## バックアップ

バックアップ運用は k3s 管理リポジトリの責務です。本リポジトリでは復旧後の確認項目のみ [`../operations/backup-restore.md`](../operations/backup-restore.md) に記載します。

| 対象 | 備考 |
| --- | --- |
| `stored_objects` テーブル | PostgreSQL バックアップに含まれる（k3s 側運用） |
| 実ファイル（本番） | JuiceFS / オブジェクト層（k3s 管理リポジトリ） |
| 実ファイル（開発） | ローカル `data/files`。開発者が必要に応じて手動 |

## セキュリティ

- ストレージは backend Pod 内（または開発ホスト）のみアクセス可能
- アップロード・ダウンロードは FastAPI 経由で認可

## 今後追加する設計

TBD:

- 画像リサイズ・サムネイル生成
- 孤立ファイルの GC 方針

## 関連ドキュメント

- [`../application/features/shopping-list.md`](../application/features/shopping-list.md)
- [`deployment.md`](deployment.md)
- [`../operations/secrets.md`](../operations/secrets.md)
