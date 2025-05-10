from __future__ import annotations
from typing import Any, Dict, AsyncIterator
from sqlalchemy import event, Engine
from contextlib import asynccontextmanager, contextmanager
from sqlalchemy.ext.asyncio import AsyncSession
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
        dbs: Dict[str, str]
) -> AsyncIterator[AsyncSession]:
    """
    SQLAlchemy のセッションに対して、SQLite の ATTACH DATABASE を実行するコンテキストマネージャ
    """
    conn = await session.connection()
    try:
        for alias, path in dbs.items():
            await conn.exec_driver_sql(_make_attach_sql(path, alias))
        yield session
    finally:
        for alias in dbs.keys():
            await conn.exec_driver_sql(_make_detach_sql(alias))

@contextmanager
def attach_dbs(
        session: Session,
        dbs: Dict[str, str]
):
    """
    SQLAlchemy のセッションに対して、SQLite の ATTACH DATABASE を実行するコンテキストマネージャ
    """
    conn = session.connection()
    try:
        for alias, path in dbs.items():
            conn.exec_driver_sql(_make_attach_sql(path, alias))
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
