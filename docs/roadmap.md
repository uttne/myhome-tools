# 今後の実装予定

## 推奨順序

1. Docker Compose + 開発用 Dockerfile
2. FastAPI + SQLModel + uv
3. Alembic
4. `users` モデル
5. `/api/me` とローカルログイン API
6. React + Vite + pnpm + proxy

## 理由

- 認証方式、ユーザーモデル、DB マイグレーションがアプリ全体の基盤になるため。
- `/api/me` ができるとフロントエンドのログイン判定をすぐ接続できるため。
- Vite proxy や React 側の画面遷移も、実 API がある方が検証しやすいため。

## バックエンド基盤

- Python プロジェクト構成
- FastAPI 起動設定
- SQLModel 設定
- Alembic 設定
- Docker Compose の backend / db 定義
- `uv` による依存管理

## フロントエンド基盤

- React + Vite セットアップ
- `/api` proxy 設定
- 認証状態管理
- ローカルログイン画面
- `pnpm` による依存管理

## k3s デプロイ

TBD:

- コンテナイメージ作成
- Kubernetes manifest
- ExternalSecret manifest
- Ingress 設定
- Cloudflare Tunnel 設定
