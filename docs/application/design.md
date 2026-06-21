# アプリケーション設計

アプリケーション全体の地図です。機能ごとの詳細は `features/` に記載します。

## 1. 目的

`myhome-tools` は、自宅 k3s 上で動作するホームラボ向け Web アプリケーションです。

家族など少人数が、Cloudflare Access 保護下のインターネット経路および LAN 内から、安全にツール群へアクセスできるようにします。

## 2. スコープ

| 区分 | 内容 |
| --- | --- |
| フェーズ 0（完了） | 認証基盤、開発環境、Helm Chart |
| フェーズ 1 以降 | 業務機能（未決） |
| スコープ外 | マルチテナント、公開 SaaS、k3s / PostgreSQL 運用 UI |

## 3. 利用者とロール

| 利用者 | ロール | 説明 |
| --- | --- | --- |
| 管理者 | `admin` | ユーザー管理、設定、全機能 |
| 家族ユーザー | `user` | 通常機能 |

認証方式（Cloudflare / ローカル）とロールは独立。詳細: `../architecture/authentication.md`

## 4. 機能モジュール

| モジュール | 仕様 | 状態 | フェーズ |
| --- | --- | --- | --- |
| 認証・セッション | [`features/auth.md`](features/auth.md) | 実装済み | 0 |
| （業務機能） | TBD | 未決 | 1+ |

新機能追加時:

1. `features/_template.md` をコピーして `features/<名前>.md` を作成
2. 下記「索引」ファイルを更新
3. GitHub Issue を作成

### 業務機能の候補（未決）

- ホームラボ運用ダッシュボード
- 家内デバイス / サービスのリンク集
- 家計・在庫・タスクなどの生活管理
- インフラ監視情報の集約

## 5. 画面マップ

```text
/              ホーム（認証 UI）          [auth]
/logout        ログアウト                 [auth]
/...           業務画面（TBD）
/admin/...     管理画面（TBD）
```

全体索引: [`screens.md`](screens.md)

## 6. API マップ

| カテゴリ | ベースパス | 仕様 | 状態 |
| --- | --- | --- | --- |
| ヘルスチェック | `/healthz`, `/readyz` | [`api.md`](api.md) | 実装済み |
| 認証 | `/api/me`, `/api/auth/*` | [`features/auth.md`](features/auth.md) | 実装済み |
| 管理者 | `/api/admin/*` | [`features/auth.md`](features/auth.md) | 未実装 |
| 業務 | `/api/...` | TBD | 未実装 |

## 7. データモデル

| エンティティ | テーブル | 仕様 | 状態 |
| --- | --- | --- | --- |
| User | `users` | [`features/auth.md`](features/auth.md) | 実装済み |

全体索引: [`domain-model.md`](domain-model.md)  
DB 設計: [`../architecture/database.md`](../architecture/database.md)

## 8. 非機能要件

| 項目 | 要件 |
| --- | --- |
| セキュリティ | Cloudflare Access + Ingress 経路限定。Secret は Git に含めない |
| 可用性 | 単一 replica から開始 |
| 保守性 | SQLModel + Alembic + Helm Chart |
| 開発 | Docker Compose 標準 |

詳細 ID 付き一覧: [`requirements.md`](requirements.md)

## 9. 実装フェーズ

| フェーズ | 内容 | 状態 |
| --- | --- | --- |
| 0 | 認証基盤 | 完了 |
| 1 | 業務機能の要件確定 | 進行中 |
| 2 | 業務 API / 画面 | 未着手 |
| 3 | JWT 検証、ユーザー管理 | 未着手 |
| 4 | 本番デプロイ | 未着手 |

詳細: [`../roadmap.md`](../roadmap.md)

## 10. 関連ドキュメント

| ドキュメント | 内容 |
| --- | --- |
| [`features/`](features/) | 機能別仕様 |
| [`requirements.md`](requirements.md) | 横断要件 |
| [`api.md`](api.md) | API 索引 |
| [`screens.md`](screens.md) | 画面索引 |
| [`domain-model.md`](domain-model.md) | ドメイン索引 |
| [`../open-questions.md`](../open-questions.md) | 未決事項 |
