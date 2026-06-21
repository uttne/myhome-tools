# 画面設計

SPA の画面索引です。機能ごとの詳細は `features/` を参照してください。

実装: `frontend/src/App.tsx`（フェーズ 1 で AppShell へ移行予定）

## 共通レイアウト

認証後は [`features/app-shell.md`](features/app-shell.md) のヘッダー + コンテンツ構成を全画面で使用します。

## 機能別画面一覧

| 機能 | 画面 | 仕様 | 状態 |
| --- | --- | --- | --- |
| 認証 | `/`, `/logout` | [`features/auth.md`](features/auth.md) | 実装済み（要 AppShell 統合） |
| アプリシェル | 共通レイアウト | [`features/app-shell.md`](features/app-shell.md) | 未着手 |
| Home | `/home` | [`features/home.md`](features/home.md) | 未着手 |
| 買い物リスト | `/shopping/*` | [`features/shopping-list.md`](features/shopping-list.md) | 未着手 |

## 全体画面マップ

```text
/                         ログイン / → /home リダイレクト
/home                     Home Hub                         [home]
/shopping                 リスト一覧                       [shopping]
/shopping/lists/:id       リスト詳細
/shopping/masters         マスター一覧
/shopping/masters/:id     マスター編集
/shopping/history         履歴一覧
/shopping/history/:id     履歴詳細
/logout                   ログアウト                       [auth]
```

## ナビゲーション（ハンバーガーメニュー）

| 項目 | パス |
| --- | --- |
| Home | `/home` |
| 買い物リスト | `/shopping` |
| ログアウト | `/logout` |

## 共通方針

- React + Vite + React Router（nested routes）
- 認証 API は `fetch` + `credentials: "include"`
- モバイルファーストのシンプル UI

## 関連

- 全体設計: [`design.md`](design.md)
