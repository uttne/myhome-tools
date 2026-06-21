# 今後の実装予定

## 完了済み（フェーズ 0）

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| Docker Compose + 開発用 Dockerfile | 完了 | `docker-compose.yml` |
| FastAPI + SQLModel + 認証 API | 完了 | `backend/app/` |
| React + Vite + 最小認証 UI | 完了 | `frontend/src/` |
| Helm Chart / 本番イメージ | 完了 | `charts/myhome-tools/` |
| ドキュメント構成（features/） | 完了 | `docs/application/` |

## フェーズ 1: 家族 Hub + 買い物リスト

設計: [`application/design.md`](application/design.md)

| 順序 | 項目 | 状態 | Issue |
| --- | --- | --- | --- |
| 1 | AppShell（ヘッダー + ハンバーガーメニュー） | 未着手 | TBD |
| 2 | Home Hub（サービスカード、固定クイックアクセス） | 未着手 | TBD |
| 3 | 買い物リスト API + DB マイグレーション | 未着手 | TBD |
| 4 | 買い物リスト画面（一覧・詳細・追加・完了） | 未着手 | TBD |
| 5 | 商品マスター CRUD | 未着手 | TBD |
| 6 | ファイルストレージ連携（`FILE_STORAGE_ROOT`、Helm PVC マウント） | 未着手 | TBD |
| 7 | マスター画像アップロード | 未着手 | TBD |
| 8 | 買い物履歴 | 未着手 | TBD |
| 9 | Home ダッシュボード指標 | 未着手 | TBD |

### 認証・管理（並行可能）

| 項目 | 優先度 | 状態 |
| --- | --- | --- |
| Cloudflare JWT 検証 | 高 | 未着手 |
| 管理者向けユーザー管理 API | 中 | 未着手 |
| 認証 UI の AppShell 統合 | 高 | 未着手 |

## フェーズ 2 以降

| 項目 | 状態 |
| --- | --- |
| 追加サービス（家計、タスクなど） | 未決 |
| クイックアクセスのカスタマイズ | 未決 |
| 買い物リスト補充アラート | 未決 |
| 本番 JuiceFS PVC マウント（k3s 管理リポジトリ連携） | 未着手 |
| 本番デプロイ（ESO、Tunnel） | 未着手 |

## 推奨実装順序

1. AppShell + 認証フロー統合（`/home` デフォルト化）
2. 買い物リスト（画像なし）で end-to-end
3. ファイルストレージ連携 + マスター画像
4. 履歴 + Home ダッシュボード
5. 本番デプロイ（PVC マウント含む）
