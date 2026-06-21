# AGENTS.md

AI エージェントと開発者向けの引き継ぎ入口です。詳細は `.cursor/rules/` と `docs/` に委譲します。

## プロジェクト概要

`myhome-tools` はホームラボ向け Web アプリケーションです。

| 項目 | 内容 |
| --- | --- |
| フェーズ | 0（認証基盤）完了。業務機能は未着手 |
| バックエンド | FastAPI + SQLModel + Alembic + uv |
| フロントエンド | React + Vite + pnpm |
| 開発環境 | Docker Compose + NGINX（`http://localhost:8080`） |
| 本番 | k3s + Helm Chart + Cloudflare Tunnel（未デプロイ） |

## エージェントハーネス

コンテキストは次の 3 層で管理します。

```text
AGENTS.md              ← このファイル（入口・方針）
.cursor/rules/*.mdc    ← 常時 / ファイル種別ごとのルール
docs/                  ← 設計・仕様・運用の詳細
```

| 層 | 用途 | 参照先 |
| --- | --- | --- |
| 入口 | 作業方針、Git ルール、索引 | このファイル |
| ルール | 実装時の規約・注意点 | `.cursor/README.md` |
| ドキュメント | 設計判断、API、画面、運用 | `docs/README.md` |

### 作業種別ごとの読み方

| 作業 | 最初に読む | 詳細 |
| --- | --- | --- |
| 全体把握 | `docs/architecture/overview.md` | `docs/application/design.md` |
| バックエンド | `.cursor/rules/backend.mdc` | `docs/application/features/`, `docs/application/api.md` |
| 認証変更 | `docs/application/features/auth.md` | `docs/architecture/authentication.md` |
| フロントエンド | `.cursor/rules/frontend.mdc` | `docs/application/screens.md`, `docs/application/features/` |
| DB / モデル | `.cursor/rules/backend.mdc` | `docs/architecture/database.md`, `docs/application/domain-model.md` |
| インフラ | `.cursor/rules/infra.mdc` | `docs/architecture/environments.md`, `docs/architecture/deployment.md` |
| ドキュメント | `.cursor/rules/docs.mdc` | `docs/README.md` |
| 進捗・フェーズ | `docs/roadmap.md` | `docs/open-questions.md` |
| 実行タスク | GitHub Issues | Issue の Acceptance Criteria |

## リポジトリ構成

```text
.
├── backend/           # FastAPI + SQLModel + Alembic
├── frontend/          # React + Vite
├── docker/            # Dockerfile / NGINX 設定
├── charts/            # Helm Chart
├── docs/              # 設計・運用ドキュメント
│   └── application/features/  # 機能別仕様
├── .cursor/rules/     # Cursor ルール
├── docker-compose.yml
├── Taskfile.yml
└── README.md          # 人間向け起動手順
```

## 開発の基本

標準は Docker Compose です。

```bash
task up
task admin:create
task check
```

| 用途 | コマンド |
| --- | --- |
| 起動 | `task up` |
| 停止 | `task down` |
| 検証 | `task check` |
| マイグレーション | `task db:migrate` |
| 一覧 | `task --list` |

ブラウザ URL: `http://localhost:8080`（Compose 利用時は `5173` を直接開かない）

ローカル直接起動、本番 image / Helm の手順は `README.md` と `docs/architecture/environments.md` を参照してください。

## 必須の注意点

- **NGINX 設定変更後**は `task nginx:reload` が必要（自動 reload しない）
- **Vite Host**: Compose では NGINX 経由のみ。`frontend:5173` 直アクセスは `403` になり得る
- **bcrypt**: `backend/pyproject.toml` で `bcrypt==4.0.1` 固定。外すと `hash_password()` が失敗する可能性あり
- **生成物の分離**: Windows ホストと Linux コンテナで `node_modules` / Python venv を共有しない

## Git / コミット

- ユーザーから明示的に依頼されるまでコミットしない
- コミットメッセージは日本語の短い要約（例: `認証 API を追加`）
- Secret や `.env` をコミットしない

## 進捗・タスク管理

| 種別 | 置き場所 |
| --- | --- |
| 進捗・フェーズ | `docs/roadmap.md` |
| 未決・論点 | `docs/open-questions.md` |
| 実行タスク | GitHub Issues |

詳細: `.cursor/rules/project.mdc`

## 実装方針

- Docker Compose 環境を基準に動作確認する
- 変更は最小限に留め、既存の命名・構成に合わせる
- 認証方式とアプリ内認可は分離し、権限は `role` で判断する
- 本番 PostgreSQL は既存環境を利用する（k3s 内に DB Pod は作らない）
- Secret 原本は GCP Secret Manager、 k3s では ESO 経由で Kubernetes Secret に同期する前提
- コードとドキュメントが食い違う場合、**コードを正**としてドキュメントを更新する

## ドキュメント索引

詳細は `docs/README.md` を参照。主要ファイル:

| ファイル | 内容 |
| --- | --- |
| `docs/application/design.md` | アプリケーション設計の起点 |
| `docs/application/features/` | 機能別仕様 |
| `docs/application/api.md` | API 索引 |
| `docs/roadmap.md` | 実装状況 |
| `docs/open-questions.md` | 未決事項 |
| `docs/architecture/authentication.md` | 認証・認可（アーキテクチャ） |
| `docs/decisions/ADR-0001-*.md` | Cloudflare + ローカル認証の ADR |
