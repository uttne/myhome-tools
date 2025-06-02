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
async def create_namespace(
    db: DbSessionDep,
    sub: SubDep,
    name: str,
    description: str = None,
):
    
    async with db as session:
        user = await get_me(session, sub, settings)  # ユーザ情報を取得しておく

        async with attach_dbs_async(session, {
                A_APP: DB_APP,
            }) as ses:
            
            namespace = AppNamespace(
                id=str(uuid4()),
                name=name,
                description=description,
                created_at=dt.datetime.now(dt.timezone.utc),
                updated_at=dt.datetime.now(dt.timezone.utc),
                owner_id=user.id,
            )
            ses.add(namespace)

            ns_user = AppNamespaceUser(
                id=str(uuid4()),
                namespace_id=namespace.id,
                user_id=user.id,
                role=NamespaceUserRole.admin,  # 初期ユーザは admin とする
            )

            ses.add(ns_user)

            await ses.commit()
        
        await init_db(session, settings.get_ns_db_path(namespace.id), settings.db_alias_ns)

    return namespace

@router.post("/api/v1/ns/{namespace_id}/users")
async def add_user():
    return {"msg": "Hello World"}

@router.get("/api/v1/ns/{namespace_id}/users")
async def get_namespace_users():
    return {"msg": "Hello World"}

@router.delete("/api/v1/ns/{namespace_id}/users/{user_id}")
async def remove_namespace_user():
    return {"msg": "Hello World"}
