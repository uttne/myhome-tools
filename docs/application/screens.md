# 画面設計

SPA の画面索引です。機能ごとの詳細は `features/` を参照してください。

実装: `frontend/src/App.tsx`

## 機能別画面一覧

| 機能 | 画面 | 仕様 | 状態 |
| --- | --- | --- | --- |
| 認証・セッション | `/`, `/logout` | [`features/auth.md`](features/auth.md) | 実装済み |
| 業務 | TBD | TBD | 未実装 |
| 管理 | TBD | TBD | 未実装 |

## 全体画面マップ（現在 + 予定）

```text
/                    ホーム（認証 UI）     [auth] 実装済み
/logout              ログアウト           [auth] 実装済み
/settings/password   パスワード設定       [auth] 未実装
/admin/users         ユーザー管理         [auth] 未実装
/...                 業務画面             TBD
```

詳細な画面遷移・UI 要素は各 `features/*.md` に記載します。

## 共通方針

- React + Vite + React Router
- 認証 API 呼び出しは `fetch` + `credentials: "include"`
- 業務画面追加時は共通レイアウト（ヘッダー、ナビ）を検討

## 関連

- 全体設計: [`design.md`](design.md)
- 認証画面詳細: [`features/auth.md`](features/auth.md)
