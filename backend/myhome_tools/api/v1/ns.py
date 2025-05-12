from fastapi import APIRouter, HTTPException
from sqlmodel import select

from myhome_tools.api.depends.type import DbSessionDep, SubDep
from myhome_tools.db.engine import attach_dbs_async
from myhome_tools.db.models.app import AppUser
from myhome_tools.settings import get_settings

router = APIRouter()
settings = get_settings()

A_APP = settings.db_alias_app
DB_APP = settings.get_app_db_path()

@router.get("/api/v1/ns")
async def get_namespaces(
    sub: SubDep,
    db: DbSessionDep,
    ):
    """
    ユーザが所有する全ての Namespace を取得する
    """
    async with db as session:
        async with attach_dbs_async(session, {A_APP: DB_APP}) as ses:
            stmt = select(AppUser).where(AppUser.sub == sub)
            result = await ses.execute(stmt)
            user = result.one_or_none()
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # db.execute("SELECT * FROM app.users WHERE sub = :sub", {"sub": sub})
    return {"msg": sub}

@router.get("/api/v1/ns/{namespace_id}")
async def get_namespace():
    return {"msg": "Hello World"}

@router.post("/api/v1/ns")
async def create_namespace():
    return {"msg": "Hello World"}

@router.post("/api/v1/ns/{namespace_id}/users")
async def add_user():
    return {"msg": "Hello World"}

@router.get("/api/v1/ns/{namespace_id}/users")
async def get_namespace_users():
    return {"msg": "Hello World"}

@router.delete("/api/v1/ns/{namespace_id}/users/{user_id}")
async def remove_namespace_user():
    return {"msg": "Hello World"}
