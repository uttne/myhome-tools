# アプリケーション要件

横断的な要件を整理します。機能ごとの要件 ID は `features/` に記載します。

全体設計: [`design.md`](design.md)

## プロダクト概要

家族で使う複数のサービス（買い物リストなど）を一つのアプリにまとめた Hub です。

- シンプルな UI（ヘッダー + コンテンツ、ハンバーガーメニュー）
- Home をデフォルト画面とし、サービス遷移・クイックアクセス・ダッシュボードを提供
- 画像データは `FILE_STORAGE_ROOT` 配下に保存（本番は JuiceFS PVC）

## 想定利用者

| 利用者 | 説明 |
| --- | --- |
| 管理者 | 初期設定、ユーザー管理、全機能 |
| 家族ユーザー | 共有データの参照・更新 |

## 機能要件（索引）

| 機能 | 要件 ID | 仕様 |
| --- | --- | --- |
| 認証・セッション | FR-AUTH-*, FR-ADMIN-* | [`features/auth.md`](features/auth.md) |
| グループ | FR-GRP-* | [`features/groups.md`](features/groups.md) |
| アプリシェル | FR-SHELL-* | [`features/app-shell.md`](features/app-shell.md) |
| Home | FR-HOME-* | [`features/home.md`](features/home.md) |
| 買い物リスト | FR-SHOP-* | [`features/shopping-list.md`](features/shopping-list.md) |

## 非機能要件

| ID | カテゴリ | 要件 |
| --- | --- | --- |
| NFR-001 | セキュリティ | 外部公開は Cloudflare Access 経由。メール制限は CF 側。API 直アクセス経路を作らない |
| NFR-002 | セキュリティ | JWT 署名鍵、DB 接続情報は Secret 管理 |
| NFR-003 | 可用性 | 単一 replica から開始。LAN はローカル認証で利用可能 |
| NFR-004 | 保守性 | Alembic マイグレーション、Helm Chart によるデプロイ |
| NFR-005 | バックアップ | PostgreSQL + ファイルストレージ（本番 JuiceFS は k3s 管理リポジトリ側） |
| NFR-006 | 開発 | Docker Compose を標準開発環境とする |
| NFR-007 | ストレージ | バイナリは `FILE_STORAGE_ROOT` 配下。PostgreSQL にファイル本体を保存しない |
| NFR-008 | UX | モバイルでも操作可能なシンプル UI |

## スコープ外（フェーズ 1）

- グループ招待、ソート view
- リスト履歴（スナップショット）
- クイックアクセスのユーザー別カスタマイズ
- 買い物リスト以外のサービス実装
- 画像リサイズ・サムネイル自動生成

## 関連ドキュメント

| ドキュメント | 内容 |
| --- | --- |
| [`features/`](features/) | 機能別要件・仕様 |
| [`design.md`](design.md) | 全体設計 |
| [`../architecture/object-storage.md`](../architecture/object-storage.md) | ファイルストレージ（`FILE_STORAGE_ROOT`） |
