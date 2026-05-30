from fastapi import APIRouter

from myhome_tools.api.depends.type import SubDep

router = APIRouter()

@router.get("/api")
async def get_root(
    sub: SubDep,
):
    return {"msg": "Hello World", "sub": sub}
