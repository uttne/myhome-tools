from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlmodel import or_, and_, select

from myhome_tools.api.depends.type import DbSessionDep, SubDep
from myhome_tools.api.utils.funcs import create_id
from myhome_tools.api.utils.me import get_me
from myhome_tools.db.engine import attach_dbs_async, init_db
from myhome_tools.db.models.app import AppNamespace, AppNamespaceUser, AppUser, NamespaceUserRole
from myhome_tools.settings import get_settings
import datetime as dt

router = APIRouter()
settings = get_settings()

A_APP = settings.db_alias_app
DB_APP = settings.get_app_db_path()

class ApiResNamespace(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_at: dt.datetime
    updated_at: dt.datetime
    owner_id: str
    role: NamespaceUserRole

    model_config = ConfigDict(from_attributes=True)

@router.get("/api/v1/ns", response_model=list[ApiResNamespace])
async def get_namespaces(
    sub: SubDep,
    db: DbSessionDep,
    ):
    """
    ユーザが所有する全ての Namespace を取得する
    """
    async with db as session:
        user = await get_me(session, sub, settings)

        async with attach_dbs_async(session, {A_APP: DB_APP}) as ses:
            stmt = (
                select(AppNamespaceUser, AppNamespace)
                .join(AppNamespace, AppNamespaceUser.namespace_id == AppNamespace.id)
                .where(
                    AppNamespaceUser.user_id == user.id,
                )
                .order_by(AppNamespace.created_at)
            )
            
            result = await ses.exec(stmt)
            app_namespaces = result.all()
    
    return [ApiResNamespace.model_validate({**ns_usr.model_dump(),**ns.model_dump()}) for ns_usr, ns in app_namespaces]

@router.get("/api/v1/ns/{namespace_id}")
async def get_namespace(namespace_id: str, db: DbSessionDep, sub: SubDep):
    """
    指定された Namespace の情報を取得する"""
    
    async with db as session:
        user = await get_me(session, sub, settings)

        async with attach_dbs_async(session, {A_APP: DB_APP}) as ses:
            stmt = (
                select(AppNamespaceUser, AppNamespace)
                .join(AppNamespace, AppNamespaceUser.namespace_id == AppNamespace.id)
                .where(
                    and_(AppNamespaceUser.user_id == user.id, AppNamespace.id == namespace_id),
                )
                .order_by(AppNamespace.created_at)
            )
            
            result = await ses.exec(stmt)
            item = result.first()
            print(item)
        
    if item is None:
        raise HTTPException(status_code=404, detail="Namespace not found or you do not have access to it")
    
    ns_usr, ns = item
    
    return ApiResNamespace.model_validate({**ns.model_dump(),**ns_usr.model_dump()})

class CreateNamespaceRequest(BaseModel):
    """
    Namespace を作成するためのリクエストボディ
    - name: Namespace の名前
    - description: Namespace の説明 (任意)
    """
    name: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

@router.post("/api/v1/ns")
async def create_namespace(
    db: DbSessionDep,
    sub: SubDep,
    request_in: CreateNamespaceRequest,
):
    
    async with db as session:
        user = await get_me(session, sub, settings)  # ユーザ情報を取得しておく

        async with attach_dbs_async(session, {
                A_APP: DB_APP,
            }) as ses:
            
            namespace = AppNamespace(
                id=create_id(),
                name=request_in.name,
                description=request_in.description,
                created_at=dt.datetime.now(dt.timezone.utc),
                updated_at=dt.datetime.now(dt.timezone.utc),
                owner_id=user.id,
            )
            ses.add(namespace)

            ns_user = AppNamespaceUser(
                id=create_id(),
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
