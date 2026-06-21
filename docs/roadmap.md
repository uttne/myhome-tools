# 今後の実装予定

## 完了済み（基盤）

以下は実装済みです。詳細は各ドキュメントとコードを参照してください。

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| Docker Compose + 開発用 Dockerfile | 完了 | `docker-compose.yml`, `docker/dev.Dockerfile` |
| 開発用 NGINX ルーティング | 完了 | `docker/nginx.dev.conf` |
| FastAPI + SQLModel + uv | 完了 | `backend/app/` |
| Alembic | 完了 | `backend/alembic/` |
| `users` モデルと初期マイグレーション | 完了 | `backend/app/models.py`, `0001_create_users` |
| 認証 API（`/api/me`, login, logout, password） | 完了 | `backend/app/main.py`, `backend/app/auth.py` |
| Cloudflare Access ヘッダー認証 + JIT プロビジョニング | 完了 | `backend/app/auth.py` |
| ローカル JWT Cookie 認証 | 完了 | `backend/app/security.py` |
| 初期管理者 CLI | 完了 | `backend/app/create_admin.py` |
| React + Vite + pnpm + React Router | 完了 | `frontend/src/` |
| ローカルログイン / ログアウト画面 | 完了 | `frontend/src/App.tsx` |
| 本番用 frontend / backend イメージ | 完了 | `docker/*.prod.Dockerfile` |
| Helm Chart | 完了 | `charts/myhome-tools/` |
| Taskfile による開発・ビルド補助 | 完了 | `Taskfile.yml` |

## 次の実装フェーズ

### 認証・管理機能の拡張

| 項目 | 優先度 | 状態 |
| --- | --- | --- |
| `Cf-Access-Jwt-Assertion` の署名検証 | 高 | 未着手 |
| 管理者向けユーザー管理 API | 中 | 未着手 |
| パスワードリセットフロー | 中 | 未着手 |
| フロントエンドのパスワード設定画面 | 中 | 未着手 |

### 業務機能

| 項目 | 優先度 | 状態 |
| --- | --- | --- |
| アプリの主要機能定義 | 高 | 未決（`application/design.md`, `application/features/` を参照） |
| ドメインモデル拡張 | 高 | 未着手 |
| 業務 API / 画面 | 高 | 未着手 |

### 本番デプロイ

| 項目 | 優先度 | 状態 |
| --- | --- | --- |
| Cloudflare Tunnel 設定 | 高 | 未着手 |
| ExternalSecret 定義 | 高 | 未着手 |
| 本番 namespace / values 確定 | 中 | 未着手 |
| `cloudflared` の冗長化 | 低 | 未着手 |

## 推奨実装順序

1. アプリの主要機能を `application/design.md` と `application/features/` で確定する。
2. ドメインモデル、API、画面を追加する。
3. Cloudflare Access JWT 検証を追加する。
4. 管理者向けユーザー管理を追加する。
5. 本番デプロイ（Helm values、ESO、Cloudflare Tunnel）を行う。
