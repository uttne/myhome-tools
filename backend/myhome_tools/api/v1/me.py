from fastapi import APIRouter

router = APIRouter()

@router.get("/api/v1/me")
async def get_me():

    # async with AsyncSessionLocal() as session:
    #     async with attach_dbs_async(session, {"app": str(DB_DIR / "app.db").replace("\\", "/")}) as ses:
    #         sql = "SELECT name FROM app.sqlite_master WHERE type = 'table';"
    #         result = await ses.execute(text(sql))
    #         return [row[0] for row in result]
    #     stmt = select(User).where(User.id == 1)
    #     result = await session.execute(stmt)
    #     user = result.one_or_none()

    #     return User.model_validate(user) if user else None
    return {"msg": "自分の情報を取得する"}
