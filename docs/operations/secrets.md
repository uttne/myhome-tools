# Secret 管理

## 方針

Secret の原本は GCP Secret Manager に保存します。

k3s からは External Secrets Operator (ESO) を利用し、GCP Secret Manager の値を Kubernetes Secret に同期します。アプリケーション Pod は同期された Kubernetes Secret を環境変数、またはファイルとして参照します。

## 管理対象

Secret として管理する情報:

- DB 接続情報
- JWT 署名鍵
- Cloudflare Access の audience
- Cloudflare Access JWT 検証用の設定
- その他、外部サービスの認証情報

## Secret の流れ

1. GCP Secret Manager に secret を登録します。
2. ESO が GCP Secret Manager から値を取得します。
3. ESO が k3s クラスター内に Kubernetes Secret を作成・更新します。
4. FastAPI Pod が Kubernetes Secret を参照して起動します。

## Git に置くもの・置かないもの

Git に置くもの:

- `ExternalSecret` などの参照定義
- secret 名
- Kubernetes Secret のキー名
- サンプル設定

Git に置かないもの:

- GCP Secret Manager 上の secret 値
- Kubernetes Secret の平文値
- DB パスワード
- JWT 署名鍵

## 今後追加する設計

TBD:

- GCP Secret Manager の secret 命名規則
- `ExternalSecret` manifest の配置場所
- ESO の認証方式
- secret ローテーション手順
