from fastapi import APIRouter

router = APIRouter()

@router.get("/api")
async def get_root():
    return {"msg": "Hello World"}
