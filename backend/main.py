from fastapi import FastAPI, Query, Request
from mangum import Mangum
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from myhome_tools.db.engine import apply_sqlite_pragmas

from sqlmodel import SQLModel, Field, Column, String, Integer
from typing import Optional
from datetime import datetime, timezone

from sqlmodel import select
from pathlib import Path

# テーブルの定義の読み込み
from myhome_tools.db import model # noqa: F401
from myhome_tools.db.engine import attach_dbs_async
from myhome_tools.db.init_database import init_db
from fastapi.openapi.utils import get_openapi


DB_DIR = Path(".") / Path("db")
DB_DATA_DIR = DB_DIR / "data"

DB_DIR.mkdir(parents=True, exist_ok=True)
DB_DATA_DIR.mkdir(parents=True, exist_ok=True)
# ════════════════════════════════════════════════════════════════


engine = create_async_engine("sqlite+aiosqlite:///:memory:")
apply_sqlite_pragmas(engine)

AsyncSessionLocal = async_sessionmaker[AsyncSession](
    engine, 
    # 生成されるセッションの型
    class_=AsyncSession, 
    # commit() 後に ORM インスタンスの属性を期限切れにしない設定
    expire_on_commit=False)

async def lifespan(app: FastAPI):
    async with AsyncSessionLocal() as session:
        # startup
        # DB の初期化処理
        await init_db(session, DB_DIR / "app.db", "app")
        yield
        # shutdown
        await engine.dispose()


# ════════════════════════════════════════════════════════════════
app = FastAPI(
    lifespan=lifespan,
    swagger_ui_parameters={
        # "persistAuthorization": True
    }
)

# ② OpenAPI スキーマを差し替える
def custom_openapi():
    if app.openapi_schema:          # キャッシュ済みなら再生成しない
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="My API",
        version="1.0.0",
        description="Sample token は既定入力されています",
        routes=app.routes,
    )

    # --- セキュリティスキームを追加（or 既存を書き換え） ----------
    openapi_schema.setdefault("components", {}).setdefault(
        "securitySchemes", {}
    )["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        # ここに書いたものが Swagger-UI のプレースホルダに出る
        "description": "サンプルトークンを貼り付け済み",
        "example": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI…",   # ★ ← ③
    }

    # ④ 全エンドポイントをデフォルトで Bearer 保護にするなら↓
    openapi_schema["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return openapi_schema

app.openapi = custom_openapi
# ════════════════════════════════════════════════════════════════

@app.get("/api")
async def get_root():
    return {"msg": "Hello World"}


@app.post("/api/v1/init")
async def post_init(request: Request):
    auth_header: str | None = request.headers.get("authorization")
    return {"token": auth_header}

@app.get("/api/v1/me")
async def get_me():

    async with AsyncSessionLocal() as session:
        async with attach_dbs_async(session, {"app": str(DB_DIR / "app.db").replace("\\", "/")}) as ses:
            sql = "SELECT name FROM app.sqlite_master WHERE type = 'table';"
            result = await ses.execute(text(sql))
            return [row[0] for row in result]
    #     stmt = select(User).where(User.id == 1)
    #     result = await session.execute(stmt)
    #     user = result.one_or_none()

    #     return User.model_validate(user) if user else None
    return {"msg": "自分の情報を取得する"}

@app.get("/api/v1/tenants/{tenant_id}/shopping/items")
async def get_shopping_items(tenant_id: str):
    return {"items": ["apple", "banana", "cherry"]}

class Item(BaseModel):
    name: str

@app.put("/api/v1/tenants/{tenant_id}/shopping/items")
async def put_shopping_items(tenant_id: str, item: Item):
    return {"items": ["apple", "banana", "cherry"]}


@app.delete("/api/v1/tenants/{tenant_id}/shopping/items/{item_id}")
async def delete_shopping_items(tenant_id: str, item_id: str):
    return {"items": ["apple", "banana", "cherry"]}


@app.get("/api/v1/tenants/{tenant_id}/shopping/list/items")
async def get_shopping_list_items(tenant_id: str):
    return {"items": ["apple", "banana", "cherry"]}


@app.delete("/api/v1/tenants/{tenant_id}/shopping/list/items/{item_id}")
async def delete_shopping_list_items(tenant_id: str, item_id: str):
    return {"items": ["apple", "banana", "cherry"]}


@app.post("/api/v1/tenants/{tenant_id}/shopping/list/items")
async def delete_shopping_list_items(tenant_id: str):
    return {"items": ["apple", "banana", "cherry"]}


@app.get("/api/v1/tenants/{tenant_id}/shopping/images")
async def get_shopping_images(tenant_id: str):
    return {"items": [{"id":"", "name": "", "url": ""}]}

@app.put("/api/v1/tenants/{tenant_id}/shopping/images")
async def put_shopping_images(tenant_id: str):
    return {"items": [{"id":"", "name": "", "url": ""}]}


@app.delete("/api/v1/tenants/{tenant_id}/shopping/images/{image_id}")
async def delete_shopping_images(tenant_id: str, image_id: str):
    return {"items": ["apple", "banana", "cherry"]}

@app.get("/api/v1/tenants/{tenant_id}/shopping/histories")
async def get_shopping_histories(tenant_id: str, _from: str = Query(alias="from"), to: str = Query()):
    return {"from": _from, "to": to}



handler = Mangum(app)
