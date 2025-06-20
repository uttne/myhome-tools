from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import create_engine

from alembic import context

# app スキーマのモデルをインポート
import myhome_tools.db.models.app # noqa: F401
from sqlmodel import SQLModel


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = SQLModel.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


opts = context.get_x_argument(as_dictionary=True)
db_path = opts.get("db_path", "db/app.db")

p = Path(db_path)
if not p.parent.exists():
    p.parent.mkdir(parents=True, exist_ok=True)

DUMMY_DATABASE_URL = "sqlite:///:memory:"

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        version_table="alembic_version",
        version_table_schema="app",
        render_as_batch=True,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    engine = create_engine(
        DUMMY_DATABASE_URL
    )
    connectable = engine

    
    def _make_attach_sql(db_path: str, alias: str) -> str:
        return f"ATTACH DATABASE '{db_path}' AS {alias!s};"

    with connectable.connect() as connection:
        connection.exec_driver_sql(_make_attach_sql(db_path, "app"))

        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            # マイグレーションバージョンテーブルのスキーマを指定
            version_table="alembic_version",
            version_table_schema="app",
            render_as_batch=True,
        )

        with context.begin_transaction():
            context.run_migrations()
        
        # コミットをしないと、SQLite のマイグレーションバージョンテーブルに
        # バージョンが入らないのでコミットを明示的に行う
        connection.commit()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
