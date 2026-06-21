# 画面設計

SPA の画面索引です。機能ごとの詳細は `features/` を参照してください。

実装: `frontend/src/App.tsx`（フェーズ 1 で AppShell へ移行予定）

## 共通レイアウト

認証後は [`features/app-shell.md`](features/app-shell.md) のヘッダー + コンテンツ構成を全画面で使用します。

## 機能別画面一覧

| 機能 | 画面 | 仕様 | 状態 |
| --- | --- | --- | --- |
| 認証 | `/`, `/logout`, `/settings/password` | [`features/auth.md`](features/auth.md) | 一部実装済み |
| アプリシェル | 共通レイアウト | [`features/app-shell.md`](features/app-shell.md) | 未着手 |
| Home | `/home` | [`features/home.md`](features/home.md) | 未着手 |
| 買い物リスト | `/shopping/*` | [`features/shopping-list.md`](features/shopping-list.md) | 未着手 |

## 全体画面マップ

フェーズ1の目標構成。フェーズ0（現状）では `/` と `/logout` のみ実装済みです。

```text
/                         未認証: ログイン / 認証済み: → /home（フェーズ1。現状は / に情報表示）
/home                     Home Hub                         [home]
/shopping                 リスト一覧                       [shopping]
/shopping/lists/:id       リスト詳細
/shopping/masters         マスター一覧
/shopping/masters/:id     マスター編集
/shopping/archived        アーカイブ済みリスト
/settings/password        パスワード設定                     [auth]
/logout                   ログアウト                       [auth]
```

## ナビゲーション（ハンバーガーメニュー）

| 項目 | パス |
| --- | --- |
| Home | `/home` |
| 買い物リスト | `/shopping` |
| パスワード設定 | `/settings/password` |
| ログアウト | `/logout` |

## 共通方針

- React + Vite + React Router（nested routes）
- 認証 API は `fetch` + `credentials: "include"`
- モバイルファーストのシンプル UI

## 関連

- 全体設計: [`design.md`](design.md)
