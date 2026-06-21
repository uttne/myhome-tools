# API 設計

FastAPI API の索引です。機能ごとの詳細は `features/` を参照してください。

実装: `backend/app/main.py`

## ベース URL

| 環境 | URL |
| --- | --- |
| 開発（Compose） | `http://localhost:8080` |
| 開発（ローカル直接起動） | `http://localhost:5173`（Vite proxy 経由） |
| 本番 | `https://app.example.com`（TBD） |

## バージョニング

アプリケーション API は **`/api/v1/`** プレフィックスで提供します。スキーマの破壊的変更が必要になった場合は `/api/v2/` を新設し、移行期間は v1 と併存させます。

| パス | バージョン | 備考 |
| --- | --- | --- |
| `/api/v1/*` | v1 | 業務 API・認証 API（現行） |
| `/healthz`, `/readyz` | — | ヘルスチェック。バージョンなし |

方針:

- 新規 API は v1 に追加する
- レスポンスの非破壊的追加（フィールド追加）は v1 のまま
- パス・必須フィールド削除・意味変更は v2 以降で検討
- フロントエンドは `/api/v1` をベースパスとして呼び出す

実装: FastAPI `APIRouter(prefix="/api/v1")`

## 機能別 API 一覧

| 機能 | パス | 仕様 | 状態 |
| --- | --- | --- | --- |
| ヘルスチェック | `/healthz`, `/readyz` | 本ファイル | 実装済み |
| 認証・セッション | `/api/v1/me`, `/api/v1/auth/*` | [`features/auth.md`](features/auth.md) | 実装済み |
| グループ | `/api/v1/groups/*` | [`features/groups.md`](features/groups.md) | 未着手 |
| 買い物リスト | `/api/v1/shopping/*` | [`features/shopping-list.md`](features/shopping-list.md) | 未着手 |
| ファイル配信 | `/api/v1/files/{id}` | [`../architecture/object-storage.md`](../architecture/object-storage.md) | 未着手 |
| ユーザー管理 | `/api/v1/admin/*` | [`features/auth.md`](features/auth.md) | 未実装 |

## 共通

### 認証方式

| 方式 | ヘッダー / Cookie | 用途 |
| --- | --- | --- |
| Cloudflare Access | `Cf-Access-Authenticated-User-Email` | 外部公開経路 |
| ローカル JWT | Cookie `myhome_access_token` | LAN、開発、フォールバック |

メール許可制限は Cloudflare Access 側で行います。アプリはヘッダーを信頼します（JWT 検証はフェーズ3）。

Cookie を使う API では `credentials: "include"` が必要です。

### 同時編集

買い物リストなどの更新 API はフェーズ1では **Last-Write-Wins** とします。

### エラーレスポンス

```json
{"detail": "エラーメッセージ"}
```

| ステータス | 発生条件 |
| --- | --- |
| `400 Bad Request` | バリデーション・業務ルール違反 |
| `401 Unauthorized` | 未認証 |
| `403 Forbidden` | 認可拒否（非メンバー、無効ユーザー等） |
| `404 Not Found` | リソース不存在 |
| `422 Unprocessable Entity` | リクエスト形式エラー |
| `500 Internal Server Error` | サーバー内部エラー |

## ヘルスチェック

### GET /healthz

プロセス死活確認。認証不要。`200 OK` → `{"message": "ok"}`

### GET /readyz

DB 接続確認。認証不要。成功 `200 OK`、DB 失敗 `500`

## スキーマ索引

| スキーマ | 機能 | 定義 |
| --- | --- | --- |
| `UserRead` | 認証 | `backend/app/schemas.py` |
| Group* | グループ | 未実装（`features/groups.md` 参照） |
| ShoppingList* | 買い物リスト | 未実装（`features/shopping-list.md` 参照） |
| StoredObject* | ファイル | 未実装 |

新機能追加時は `features/<機能>.md` に API 詳細を記載し、ここに索引行を追加します。
