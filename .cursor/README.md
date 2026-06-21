# Cursor エージェントハーネス

このディレクトリは、Cursor AI エージェント向けの永続コンテキストを管理します。

## 構成

```text
.cursor/
├── README.md           # このファイル
└── rules/
    ├── project.mdc     # 常時適用: プロジェクト共通ルール
    ├── backend.mdc     # backend/** 作業時
    ├── frontend.mdc    # frontend/** 作業時
    ├── infra.mdc       # docker / charts / Compose / Taskfile 作業時
    └── docs.mdc        # docs/** 作業時
```

## レイヤー分担

| ファイル | 役割 |
| --- | --- |
| `AGENTS.md` | 入口。ハーネス全体の地図と作業方針 |
| `.cursor/rules/` | 短い実装規約。ファイル種別に応じて自動適用 |
| `docs/` | 設計・仕様・運用の詳細。必要に応じて読む |

## ルール追加の方針

- 1 ファイル 1 関心。50 行以内を目安にする
- 設計の詳細は `docs/` に書き、ルールには「何を守るか」だけ残す
- 常時適用は `project.mdc` のみに限定する
- 大きな設計判断は `docs/decisions/` に ADR として残す

## ドキュメント整理時の注意

`docs/` の大規模整理は、ハーネス整備後に行う。整理中は:

1. `docs/README.md` の索引を先に更新する
2. `AGENTS.md` の索引を追随させる
3. コードと矛盾する記述があればコードを正とする
