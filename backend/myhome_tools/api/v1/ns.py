from fastapi import APIRouter

from myhome_tools.api.depends.type import DbSessionDep, SubDep

router = APIRouter()

@router.get("/api/v1/ns")
async def get_namespaces(
    sub: SubDep,
    db: DbSessionDep,
    ):
    """
    ユーザが所有する全ての Namespace を取得する
    """
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
