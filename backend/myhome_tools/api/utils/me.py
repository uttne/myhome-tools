from sqlmodel.ext.asyncio.session import AsyncSession
from myhome_tools.api.exceptions.conflict import NotInitializedError
from myhome_tools.db.engine import attach_dbs_async
from myhome_tools.settings import Settings

from sqlmodel import select
from myhome_tools.db.models.app import AppUser

async def get_me(session: AsyncSession, sub: str, settings: Settings) -> AppUser:
    """
    自分の情報を取得する
    """
    A_APP = settings.db_alias_app
    DB_APP = settings.get_app_db_path()

    async with attach_dbs_async(session, {A_APP: DB_APP}) as ses:
        stmt = select(AppUser).where(AppUser.sub == sub)
        result = await ses.scalars(stmt)
        user = result.one_or_none()

        if user is None:
            raise NotInitializedError()

        return user.model_dump(mode="python")
