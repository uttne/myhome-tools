from __future__ import annotations

from typing import Iterable
from sqlalchemy import Table
from sqlmodel import SQLModel
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from myhome_tools.db.engine import attach_dbs_async

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

    

    