# 機能仕様

機能ごとのアプリケーション仕様を格納します。

## ファイル一覧

| ファイル | 機能 | 状態 |
| --- | --- | --- |
| [`auth.md`](auth.md) | 認証・セッション・ユーザー管理 | 実装済み（管理 API は未実装） |
| [`groups.md`](groups.md) | グループ（個人 / 共有） | 未着手 |
| [`app-shell.md`](app-shell.md) | 共通レイアウト・ナビゲーション | 未着手 |
| [`home.md`](home.md) | Home Hub・クイックアクセス・ダッシュボード | 未着手 |
| [`shopping-list.md`](shopping-list.md) | 買い物リスト | 未着手 |
| [`_template.md`](_template.md) | 新機能追加用テンプレート | — |

## 新機能の追加手順

1. `_template.md` をコピーして `<機能名>.md` を作成
2. [`design.md`](../design.md) の機能モジュール一覧を更新
3. [`api.md`](../api.md), [`screens.md`](../screens.md), [`domain-model.md`](../domain-model.md) の索引を更新
4. GitHub Issue を作成（Acceptance Criteria を記載）

## 関連

- 全体設計: [`../design.md`](../design.md)
- ファイルストレージ: [`../../architecture/object-storage.md`](../../architecture/object-storage.md)
- 横断要件: [`../requirements.md`](../requirements.md)
