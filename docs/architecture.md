# ホームラボ アプリケーション設計ドキュメント

## 1. システム概要

自宅の k3s クラスター上にデプロイする Web アプリケーションです。

Cloudflare Tunnel を利用し、ルーターやサーバーで外部向けポートを開放せずにインターネットへ公開します。公開経路は Cloudflare Access で保護し、アプリケーション側ではローカル認証も持つハイブリッド認証方式を採用します。

この構成により、通常時は Cloudflare Access によるゼロトラスト認証を使い、LAN 内アクセスや Cloudflare 側の障害時にはアプリ独自のローカル認証で利用できるようにします。

## 2. 技術スタック・インフラ構成

| コンポーネント | 本番環境 (k3s) | 開発環境 (Local PC) | 役割 |
| --- | --- | --- | --- |
| フロントエンド | React のビルド成果物 | React + Vite | UI/UX の構築 |
| Web サーバー | NGINX | Vite dev server + proxy | 本番では静的ファイル配信、開発では HMR と API プロキシ |
| バックエンド | FastAPI | FastAPI + Uvicorn | API、認証ロジック、DB 操作 |
| データベース | 既存 PostgreSQL 上の専用 DB | PostgreSQL on Docker | メインデータストア |
| ORM / DB 管理 | SQLModel + Alembic | SQLModel + Alembic | モデル定義とマイグレーション管理 |
| 公開 / ゲートウェイ | Cloudflare Tunnel | なし | 外部からの安全なアクセス経路 |

## 3. ネットワーク・トラフィックフロー

### 3.1 本番環境

フロントエンドとバックエンドを同一ドメイン配下に配置し、Cloudflare Access の保護対象にします。

1. ユーザーが `https://app.example.com` にアクセスします。
2. Cloudflare Access が認証画面を表示します。
3. 認証成功後、Cloudflare がリクエストヘッダーにユーザー情報を付与します。
4. Cloudflare Tunnel の `cloudflared` が暗号化されたトンネル経由で k3s 内部へ転送します。
5. k3s Ingress Controller がパスベースでルーティングします。

ルーティング方針:

| パス | 転送先 | 役割 |
| --- | --- | --- |
| `/` | NGINX コンテナ | React の静的ファイルを返す。JWT 検証は行わない |
| `/api/*` | FastAPI コンテナ | API 処理と認証・認可を行う |

信頼境界:

- FastAPI はインターネットから直接到達できない構成にします。
- 本番の API アクセス経路は Cloudflare Access、Cloudflare Tunnel、k3s Ingress を通る経路に限定します。
- `Cf-Access-Authenticated-User-Email` は Cloudflare Access 経由で付与されるヘッダーとして扱いますが、より厳密にするため `Cf-Access-Jwt-Assertion` の署名検証もバックエンド側で行う方針とします。
- Ingress や Service の設定で、Cloudflare Tunnel を迂回して FastAPI に到達できる外部経路を作らないようにします。

### 3.2 開発環境

データベースのみをコンテナ化し、フロントエンドとバックエンドはローカル PC 上で直接起動します。

| コンポーネント | URL / 起動方式 |
| --- | --- |
| フロントエンド | `http://localhost:5173` / Vite |
| バックエンド | `http://localhost:8000` / Uvicorn |
| データベース | Docker Compose 上の PostgreSQL |

Vite の `vite.config.ts` で `/api` へのリクエストを `http://localhost:8000` に proxy し、開発時の CORS 問題を避けます。

## 4. 認証・認可設計

本システムでは、Cloudflare Access による外部公開時の認証と、アプリケーション独自のローカル認証を併用します。

### 4.1 FastAPI の認証優先順位

API リクエストを受け取った FastAPI は、次の順序でユーザーを特定します。

1. Cloudflare Access 認証
   - `Cf-Access-Authenticated-User-Email` を確認します。
   - 可能であれば `Cf-Access-Jwt-Assertion` の署名、audience、有効期限も検証します。
   - 検証に成功した場合、そのメールアドレスで `users` テーブルを検索します。
   - DB にユーザーが存在しない場合は JIT プロビジョニングの条件を満たす場合のみ自動作成します。
2. ローカル JWT 認証
   - Cloudflare ヘッダーが存在しない場合、Cookie または `Authorization` ヘッダーのローカル JWT を検証します。
   - 主に LAN 内アクセス、開発環境、Cloudflare 側障害時のフォールバックとして利用します。
3. 未認証
   - どちらの認証情報も存在しない、または無効な場合は `401 Unauthorized` を返します。

### 4.2 users テーブルの設計要件

Cloudflare Access 経由で作成されるユーザーはローカルパスワードを持たないため、`password_hash` は `NULL` を許容します。

想定カラム:

| カラム | 概要 |
| --- | --- |
| `id` | 内部ユーザー ID |
| `email` | ログイン識別子。ユニーク制約を付与 |
| `password_hash` | ローカル認証用。Cloudflare 専用ユーザーでは `NULL` |
| `display_name` | 表示名 |
| `role` | 権限ロール |
| `auth_provider` | 初回作成時の認証元。例: `cloudflare`, `local` |
| `is_active` | ログイン許可状態 |
| `created_at` | 作成日時 |
| `updated_at` | 更新日時 |

LAN 内アクセス用に、Cloudflare Access 経由で作成されたユーザーが後からローカルパスワードを設定できるエンドポイントを用意します。

### 4.3 JIT プロビジョニング方針

Cloudflare Access 経由で未登録ユーザーがアクセスした場合、次の条件を満たす場合のみユーザーを自動作成します。

- Cloudflare Access の JWT 検証に成功していること。
- メールアドレスが許可リスト、または許可ドメインに一致していること。
- 初期ロールは `user` などの一般ユーザーに固定すること。
- 管理者ロールは JIT プロビジョニングでは付与しないこと。
- 必要に応じて、初回作成直後は `is_active = false` とし、管理者承認後に有効化する運用も選べるようにすること。

家族利用では、最初は「許可メールアドレス一覧」を設定で管理する方式が扱いやすいです。利用者が増える場合は、許可ドメインと管理者承認を組み合わせる方式を検討します。

### 4.4 フロントエンドの画面遷移

アプリ初期ロード時に FastAPI の `/api/me` を呼び出し、認証状態を判定します。

| `/api/me` の結果 | フロントエンドの挙動 |
| --- | --- |
| `200 OK` | ログイン済みとしてメイン画面を描画 |
| `401 Unauthorized` | ローカルログイン画面を表示 |

Cloudflare Access 経由では Access 認証後に `/api/me` が成功するため、アプリ上ではシームレスにログイン済み状態になります。

### 4.5 ローカル認証・セッション方針

LAN 内アクセスでは、ローカル認証も通常利用と同等に扱います。ただし、認証方式によって権限を変えるのではなく、アプリ内の認可は `role` や権限スコープで統一して判断します。

ローカル JWT はブラウザ保存の安全性を優先し、原則として Cookie で扱います。

| 環境 | Cookie 設定方針 |
| --- | --- |
| 本番 HTTPS | `HttpOnly`, `Secure`, `SameSite=Lax` |
| LAN HTTPS | `HttpOnly`, `Secure`, `SameSite=Lax` |
| LAN HTTP | `HttpOnly`, `SameSite=Lax`。`Secure` は利用不可 |
| 開発環境 | `HttpOnly`, `SameSite=Lax`。必要に応じて `Secure` を無効化 |

状態変更 API では CSRF リスクを考慮します。まずは `SameSite=Lax` を基本とし、管理者操作、パスワード変更、ユーザー作成など重要操作では CSRF トークンまたは再認証を検討します。

LAN 内も通常利用するため、可能であれば家庭内 DNS と自己署名または内部 CA による HTTPS 化を検討します。初期構築では HTTP を許容しても、Cookie 設定を環境変数で切り替えられるようにします。

### 4.6 認可方針

Cloudflare Access 経由かローカル JWT 経由かは本人確認の方法であり、アプリ内権限とは分離します。

| ロール | 想定権限 |
| --- | --- |
| `admin` | ユーザー管理、設定変更、全データ操作 |
| `user` | 通常機能の利用 |

API ごとに必要ロールを明示し、管理者向け API では必ず `admin` を要求します。認証方式だけを理由に管理者操作を許可しない方針とします。

### 4.7 ユーザー管理方針

初期管理者は JIT プロビジョニングではなく、seed または CLI スクリプトで作成します。これにより、Cloudflare Access の設定ミスによって管理者ユーザーが自動作成されることを避けます。

家族ユーザーの追加方法:

1. 管理者が許可メールアドレスを設定に追加します。
2. 対象ユーザーが Cloudflare Access 経由で初回ログインします。
3. 条件を満たせば JIT プロビジョニングで一般ユーザーとして作成されます。
4. LAN 内でも利用する場合、ログイン済み状態でローカルパスワードを設定します。

パスワード設定・リセット:

- `password_hash = NULL` のユーザーはローカルログインできません。
- 本人が Cloudflare Access 経由でログイン済みの場合、自分のローカルパスワードを設定できます。
- 管理者はユーザーのローカルログイン無効化、パスワードリセット要求、ユーザー無効化を行えます。
- 管理者が平文の初期パスワードを発行する運用は避け、リセットトークンまたは本人による再設定を基本とします。

## 5. 開発ワークフロー

### 5.1 ローカル起動

1. PostgreSQL を起動します。

   ```bash
   docker compose up -d db
   ```

2. Alembic でマイグレーションを適用します。

   ```bash
   alembic upgrade head
   ```

3. FastAPI を起動します。

   ```bash
   uvicorn app.main:app --reload
   ```

4. React/Vite を起動します。

   ```bash
   npm run dev
   ```

### 5.2 シードデータ

開発環境向けに、テストユーザーや初期データを投入する Python スクリプトを用意します。これにより、新しい開発環境でも短い手順でアプリを動かせるようにします。

## 6. 本番運用の最小設計

### 6.1 本番 PostgreSQL の利用方針

本番用 PostgreSQL は既存の PostgreSQL 環境を利用します。本アプリ専用に新しいデータベースを作成し、アプリケーションデータはその専用 DB に格納します。

PostgreSQL 自体の運用、永続化、バックアップ、監視は既存 PostgreSQL 側の運用に委ねます。本アプリの k3s マニフェストでは PostgreSQL Pod や PVC は管理しません。

アプリ側で決める項目:

- 専用 DB 名
- アプリ接続用 DB ユーザー
- アプリ接続用 DB ユーザーの権限範囲
- 接続先 host / port
- Alembic の適用対象 DB

### 6.2 バックアップ・復旧

バックアップ・復旧は既存 PostgreSQL の運用で扱います。本アプリ側では、復旧時に必要な情報として DB 名、マイグレーション履歴、アプリバージョンの対応関係を把握できるようにします。

アプリ側で確認する項目:

- 専用 DB が既存 PostgreSQL のバックアップ対象に含まれること。
- 復旧時に Alembic の `alembic_version` テーブルも復元されること。
- 復旧後、アプリのバージョンと DB スキーマのバージョンが一致すること。

### 6.3 Secret 管理

DB 接続情報、JWT 署名鍵、Cloudflare Access の audience、Cloudflare Access JWT 検証用の設定は Secret として管理します。

Secret の原本は GCP Secret Manager に保存します。k3s からは External Secrets Operator (ESO) を利用し、GCP Secret Manager の値を Kubernetes Secret に同期します。アプリケーション Pod は同期された Kubernetes Secret を環境変数、またはファイルとして参照します。

Secret の流れ:

1. GCP Secret Manager に secret を登録します。
2. ESO が GCP Secret Manager から値を取得します。
3. ESO が k3s クラスター内に Kubernetes Secret を作成・更新します。
4. FastAPI Pod が Kubernetes Secret を参照して起動します。

Git には GCP Secret Manager 上の secret 値や Kubernetes Secret の平文値をコミットしません。Git に置くのは `ExternalSecret` など、secret 名や参照定義に限定します。

### 6.4 マイグレーション適用

Alembic マイグレーションは、アプリの新バージョンを反映する前に適用します。

初期構成では手動実行でもよいですが、次のルールを守ります。

- 本番適用前に既存 PostgreSQL 側のバックアップ状況を確認する。
- 開発 DB で `alembic upgrade head` を確認する。
- 破壊的変更がある場合は、データ退避または段階的マイグレーションを検討する。

### 6.5 監視・ヘルスチェック

FastAPI にはヘルスチェック用エンドポイントを用意します。

| エンドポイント | 用途 |
| --- | --- |
| `/healthz` | プロセスが起動していることを確認する liveness probe |
| `/readyz` | DB 接続など依存先を確認する readiness probe |

ログはまずコンテナ標準出力に出し、k3s 側で確認できるようにします。必要になった段階で Loki などのログ集約を検討します。

## 7. 追加検討事項

ここまでの設計で初期実装に必要な方針はおおむね決まっています。次の項目は初期リリース後、または必要性が見えてから追加で検討します。

### 7.1 `cloudflared` の冗長化

初期構成では単一の `cloudflared` でも運用できますが、外部公開の可用性を上げる場合は複数 replica で稼働させます。

### 7.2 イメージビルドとデプロイ方式

最初は手動ビルド・手動デプロイでも構いません。更新頻度が上がる場合は、GitHub Actions などでコンテナイメージをビルドし、k3s へ反映する流れを整えます。

### 7.3 ログ集約と監視

初期構成では `kubectl logs` で確認できれば十分です。障害調査が増える場合は Loki、Prometheus、Grafana などの導入を検討します。

### 7.4 開発環境と本番環境の差分を小さくする

現在の方針では開発環境はローカル実行、本番は k3s 実行です。開発体験は良い一方で、環境差分による問題が出る可能性があります。

必要に応じて、バックエンドも Docker Compose で起動できる補助設定を用意しておくと、本番に近い形で再現確認できます。

## 8. 未決事項

次の項目は実装前、または初期実装中に決める必要があります。

| 項目 | 推奨初期判断 |
| --- | --- |
| LAN 内アクセスの HTTPS 化 | 初期は HTTP も許容し、将来的に家庭内 HTTPS 化を検討 |
| 家族ユーザーの追加方法 | 管理者が許可メールアドレスを設定し、Cloudflare Access 経由で初回ログイン |
| 管理者人数 | 初期は 1 名。必要になったら追加 |
| パスワードリセット | 管理者がリセット要求を発行し、本人が再設定 |
| バックアップ運用 | 既存 PostgreSQL 側のバックアップ対象に専用 DB を含める |
| Cloudflare Access JWT 検証 | 初期実装から入れるのが望ましい |
| Secret 管理 | GCP Secret Manager を原本とし、ESO で Kubernetes Secret に同期 |

## 9. 最初に着手する順序

最初はバックエンドの土台から作るのが適しています。

理由:

- 認証方式、ユーザーモデル、DB マイグレーションがアプリ全体の基盤になるため
- `/api/me` ができるとフロントエンドのログイン判定をすぐ接続できるため
- Vite proxy や React 側の画面遷移も、実 API がある方が検証しやすいため

推奨順序:

1. Docker Compose + PostgreSQL
2. FastAPI + SQLModel
3. Alembic
4. `users` モデル
5. `/api/me` とローカルログイン API
6. React + Vite + proxy
