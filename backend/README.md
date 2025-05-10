
## Lambda 用のzip の生成方法

```bash
uv run task build
```

--------------------------------------

## DB

### DB のマイグレーション作成

```bash
# app
uv run alembic -c ./alembic_app.ini revision --autogenerate -m "{マイグレーションメッセージ}"

# ns
uv run alembic -c ./alembic_ns.ini revision --autogenerate -m "{マイグレーションメッセージ}"
```

### DB のマイグレーション反映

```bash
# app
uv run alembic -c ./alembic_app.ini upgrade head

# ns
uv run alembic -c ./alembic_ns.ini -x db_path=${db_file} upgrade head
# 例
# uv run alembic -c ./alembic_ns.ini -x db_path=db/data/temp.db upgrade head
```
