from fastapi import APIRouter

from myhome_tools.api.depends.type import DbSessionDep, SubDep
from myhome_tools.api.exceptions.conflict import NotInitializedError
from myhome_tools.api.utils.funcs import create_id
from myhome_tools.db.engine import attach_dbs_async
from myhome_tools.db.models.app import AppUser
from myhome_tools.settings import get_settings
from myhome_tools.api.utils.me import get_me as _get_me
from myhome_tools.db.engine import init_db

router = APIRouter()

settings = get_settings()

A_APP = settings.db_alias_app
DB_APP = settings.get_app_db_path()

@router.get("/api/v1/me")
async def get_me(
    sub: SubDep,
    db: DbSessionDep,
):
    async with db as session:
        user = await _get_me(session, sub, settings)
        return user

@router.post("/api/v1/me/init")
async def init_me(
    sub: SubDep,
    db: DbSessionDep,
):
    """
    ユーザの初期化処理
    例えば、初回アクセス時にユーザ情報を作成するなど
    """
    async with db as session:
        try:
            await _get_me(session, sub, settings)
            return {"msg": "ユーザは既に初期化されています"}
        except NotInitializedError:
            # ユーザが初期化されていないので初期化処理に入るため pass する
            print("ユーザーが存在しないため、初期化処理を実行します")
            pass
        
    
        async with attach_dbs_async(session, {A_APP: DB_APP}) as ses:
            ses.add(
                AppUser(
                    id=create_id(),
                    sub=sub,
                    name="初期ユーザ",
                    email=""
                )
            )
            await ses.commit()
    

    # ここにユーザの初期化処理を実装
    return {"msg": "ユーザの初期化処理を実行しました"}

