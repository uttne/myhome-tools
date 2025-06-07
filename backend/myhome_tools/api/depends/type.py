from typing import Annotated, AsyncIterator
from fastapi import Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from contextlib import asynccontextmanager

from myhome_tools.api.depends.jwt import get_sub_from_verified_token
from myhome_tools.db.engine import get_async_session

# ════════════════════════════════════════════════════════════════
# FastAPI の依存性注入用
# ════════════════════════════════════════════════════════════════

@asynccontextmanager
async def get_async_session_no_params() -> AsyncIterator[AsyncSession]:
    """引数が存在すると API から指定ができてしまうので、引数なしの関数を定義する"""
    async with get_async_session() as session:
        yield session

DbSessionDep = Annotated[AsyncIterator[AsyncSession], Depends(get_async_session_no_params)]
"""
# FastAPI で DB を使う用

例
```python
@router.get("/items")
async def list_items(db: DbSessionDep):
    result = await db.execute(text("SELECT * FROM items"))
    return result.fetchall()
```
"""

SubDep = Annotated[str, Depends(get_sub_from_verified_token)]
"""
Access Token から sub を取得する用
例
```python
@router.get("/items")
async def list_items(sub: SubDep):
    return {"sub": sub}
```
"""
