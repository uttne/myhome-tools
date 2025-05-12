from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from myhome_tools.api.depends.jwt import get_sub_from_verified_token
from myhome_tools.db.engine import get_async_session

# ════════════════════════════════════════════════════════════════
# FastAPI の依存性注入用
# ════════════════════════════════════════════════════════════════
DbSessionDep = Annotated[AsyncSession, Depends(get_async_session)]
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
