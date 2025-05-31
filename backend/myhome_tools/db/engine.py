from __future__ import annotations
from functools import lru_cache
from typing import Any, Dict, AsyncIterator
from sqlalchemy import event, Engine
from contextlib import asynccontextmanager, contextmanager
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import Session
from typing import Iterable
from sqlalchemy import Table
from sqlmodel import SQLModel
from pathlib import Path

def apply_sqlite_pragmas(engine: Engine | Any) -> None:
    """
    SQLAlchemy Engine に PRAGMA を自動実行する connect フックを仕込む
    """

    target = getattr(engine, "sync_engine", engine)

    # SQLite の場合のみ PRAGMA を実行する
    if target.dialect.name == "sqlite":
        @event.listens_for(target, "connect")
        def _set_pragmas(dbapi_conn, _):
            cur = dbapi_conn.cursor()
            cur.execute("PRAGMA journal_mode=DELETE")
            cur.close()

def _make_attach_sql(db_path: str, alias: str) -> str:
    return f"ATTACH DATABASE '{db_path}' AS {alias!s};"

def _make_detach_sql(alias: str) -> str:
    return f"DETACH DATABASE {alias!s};"

@asynccontextmanager
async def attach_dbs_async(
        session: AsyncSession,
        dbs: Dict[str, Path]
) -> AsyncIterator[AsyncSession]:
    """
    SQLAlchemy のセッションに対して、SQLite の ATTACH DATABASE を実行するコンテキストマネージャ
    """
    try:
        conn = await session.connection()
        for alias, path in dbs.items():
            await conn.exec_driver_sql(_make_attach_sql(str(path).replace("\\", "/"), alias))

        yield session
    finally:
        # conn をそのまま使うとエラーになってしまうので、再取得する
        conn = await session.connection()
        for alias in dbs.keys():
            await conn.exec_driver_sql(_make_detach_sql(alias))

@contextmanager
def attach_dbs(
        session: Session,
        dbs: Dict[str, Path]
):
    """
    SQLAlchemy のセッションに対して、SQLite の ATTACH DATABASE を実行するコンテキストマネージャ
    """
    conn = session.connection()
    try:
        for alias, path in dbs.items():
            conn.exec_driver_sql(_make_attach_sql(str(path).replace("\\", "/"), alias))
        yield session
    finally:
        for alias in dbs.keys():
            conn.exec_driver_sql(_make_detach_sql(alias))


# ════════════════════════════════════════════════════════════════
# ここから下は、SQLAlchemy のセッションを使って SQLite の ATTACH DATABASE を実行するための関数群
# ════════════════════════════════════════════════════════════════
def tables_for(schema: str) -> Iterable["Table"]:
    """
    指定されたスキーマに属するテーブルを取得する
    """
    return [
        tbl for tbl in SQLModel.metadata.sorted_tables if tbl.schema == schema
    ]

async def init_db(session:AsyncSession, db_path: Path, schema: str) -> None:
    """
    指定されたスキーマのデータベースを初期化する
    """

    if db_path.exists():
        print(f"Database already exists at {db_path}")
        return
    
    async with attach_dbs_async(session, {schema: str(db_path).replace("\\", "/")}) as ses:
        conn = await ses.connection()

        await conn.run_sync(
            lambda _conn: SQLModel.metadata.create_all(_conn, tables=tables_for(schema))
        )

        await conn.commit()
        
    
    print(f"Database initialized at {db_path}")

# ════════════════════════════════════════════════════════════════
# シングルトン
# ════════════════════════════════════════════════════════════════


DEFAULT_URL = "sqlite+aiosqlite:///:memory:"

@lru_cache
def get_engine(url: str = DEFAULT_URL) -> AsyncEngine:
    """
    URL ごとに 1 つだけ Engine を作る。
    引数無し＝実質シングルトン、引数あり＝“プール分け”も可。
    """
    engine = create_async_engine(url, pool_pre_ping=True)

    # 必ず実行する PRAGMA を登録する
    apply_sqlite_pragmas(engine)

    return engine

@lru_cache
def get_sessionmaker(url: str = DEFAULT_URL) -> async_sessionmaker[AsyncSession]:
    """
    URL ごとに 1 つだけ Session を作る。
    引数無し＝実質シングルトン、引数あり＝“プール分け”も可。
    """
    return async_sessionmaker[AsyncSession](
        get_engine(url), 
        # 生成されるセッションの型
        class_=AsyncSession, 
        # commit() 後に ORM インスタンスの属性を期限切れにしない設定
        expire_on_commit=False)


@asynccontextmanager
async def get_async_session(url: str | None = None) -> AsyncIterator[AsyncSession]:
    AsyncSessionLocal = get_sessionmaker(url or DEFAULT_URL)
    async with AsyncSessionLocal() as session:
        yield session

