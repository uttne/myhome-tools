# アプリケーション設計



アプリケーション全体の地図です。機能ごとの詳細は `features/` に記載します。



## 1. 目的



`myhome-tools` は、自宅 k3s 上で動作する**家族向けサービス Hub** Web アプリケーションです。



買い物リストなど、家庭で使う複数のサービスを一つのアプリにまとめ、Cloudflare Access 保護下のインターネット経路および LAN 内から安全に利用できるようにします。



## 2. スコープ



| 区分 | 内容 |

| --- | --- |

| フェーズ 0（完了） | 認証基盤、開発環境、Helm Chart |

| フェーズ 1（進行中） | AppShell、Home Hub、買い物リスト、ファイルストレージ連携 |

| スコープ外 | マルチテナント、公開 SaaS、k3s / PostgreSQL 運用 UI |



## 3. 利用者とロール



| 利用者 | ロール | 説明 |

| --- | --- | --- |

| 管理者 | `admin` | ユーザー管理、設定、全機能 |

| 家族ユーザー | `user` | 通常機能（家族共有データの参照・更新） |



認証方式（Cloudflare / ローカル）とロールは独立。詳細: `../architecture/authentication.md`



業務データは**家族共有**を前提とします（買い物リストなど）。



## 4. UI 方針



| 項目 | 方針 |

| --- | --- |

| レイアウト | ヘッダー + コンテンツの 2 段構成 |

| ナビゲーション | ハンバーガーメニュー（ドロワー） |

| デフォルト画面 | `/home`（サービス Hub） |

| クイックアクセス | 初期はコード固定、将来カスタマイズ |



詳細: [`features/app-shell.md`](features/app-shell.md)



## 5. 機能モジュール



| モジュール | 仕様 | 状態 | フェーズ |

| --- | --- | --- | --- |

| 認証・セッション | [`features/auth.md`](features/auth.md) | 実装済み | 0 |

| アプリシェル | [`features/app-shell.md`](features/app-shell.md) | 未着手 | 1 |

| Home（Hub） | [`features/home.md`](features/home.md) | 未着手 | 1 |

| 買い物リスト | [`features/shopping-list.md`](features/shopping-list.md) | 未着手 | 1 |



### 将来のサービス候補



- 家計・予算管理

- タスク / 家事分担

- 家内デバイスリンク集

- インフラ監視サマリー



## 6. 画面マップ



```text

/                         未認証: ログイン / 認証済み: /home へ

/home                     サービス Hub                    [home]

/shopping                 買い物リスト一覧                 [shopping]

/shopping/lists/:id       リスト詳細

/shopping/masters         商品マスター

/shopping/masters/:id     マスター編集

/shopping/history         履歴一覧

/shopping/history/:id     履歴詳細

/logout                   ログアウト                      [auth]

```



全体索引: [`screens.md`](screens.md)



## 7. API マップ



| カテゴリ | ベースパス | 仕様 | 状態 |

| --- | --- | --- | --- |

| ヘルスチェック | `/healthz`, `/readyz` | [`api.md`](api.md) | 実装済み |

| 認証 | `/api/me`, `/api/auth/*` | [`features/auth.md`](features/auth.md) | 実装済み |

| Home 集約 | `/api/home/*` | [`features/home.md`](features/home.md) | 未着手 |

| 買い物リスト | `/api/shopping/*` | [`features/shopping-list.md`](features/shopping-list.md) | 未着手 |

| 管理者 | `/api/admin/*` | [`features/auth.md`](features/auth.md) | 未実装 |



## 8. データモデル



| エンティティ | テーブル | 仕様 | 状態 |

| --- | --- | --- | --- |

| User | `users` | [`features/auth.md`](features/auth.md) | 実装済み |

| ShoppingList | `shopping_lists` | [`features/shopping-list.md`](features/shopping-list.md) | 未着手 |

| ShoppingListItem | `shopping_list_items` | 同上 | 未着手 |

| ShoppingItemMaster | `shopping_item_masters` | 同上 | 未着手 |

| ShoppingListHistory | `shopping_list_history` | 同上 | 未着手 |

| StoredObject | `stored_objects` | [`../architecture/object-storage.md`](../architecture/object-storage.md) | 未着手 |



全体索引: [`domain-model.md`](domain-model.md)



## 9. インフラ（フェーズ 1 追加）



| コンポーネント | 用途 | 設計 |

| --- | --- | --- |

| JuiceFS PVC（本番） | 画像などのファイルストレージ（k3s 管理リポジトリで構築） | [`../architecture/object-storage.md`](../architecture/object-storage.md) |

| PostgreSQL | メタデータ・業務データ | 既存 |



## 10. 非機能要件



| 項目 | 要件 |

| --- | --- |

| セキュリティ | Cloudflare Access + Ingress 経路限定。Secret は Git に含めない |

| 可用性 | 単一 replica から開始 |

| 保守性 | SQLModel + Alembic + Helm Chart |

| 開発 | Docker Compose 標準 |

| ストレージ | バイナリは `FILE_STORAGE_ROOT` 配下。開発はローカル、本番は JuiceFS PVC |



詳細: [`requirements.md`](requirements.md)



## 11. 実装フェーズ



| フェーズ | 内容 | 状態 |

| --- | --- | --- |

| 0 | 認証基盤 | 完了 |

| 1a | AppShell + Home | 未着手 |

| 1b | 買い物リスト（画像なし） | 未着手 |

| 1c | ファイルストレージ + マスター画像 | 未着手 |

| 1d | 履歴 + ダッシュボード | 未着手 |

| 2 | 他サービス追加 | 未着手 |

| 3 | JWT 検証、ユーザー管理 | 未着手 |

| 4 | 本番デプロイ（PVC マウント含む） | 未着手 |



詳細: [`../roadmap.md`](../roadmap.md)



## 12. 関連ドキュメント



| ドキュメント | 内容 |

| --- | --- |

| [`features/`](features/) | 機能別仕様 |

| [`requirements.md`](requirements.md) | 横断要件 |

| [`api.md`](api.md) | API 索引 |

| [`screens.md`](screens.md) | 画面索引 |

| [`domain-model.md`](domain-model.md) | ドメイン索引 |

| [`../architecture/object-storage.md`](../architecture/object-storage.md) | ファイルストレージ（`FILE_STORAGE_ROOT`） |

| [`../open-questions.md`](../open-questions.md) | 未決事項 |

