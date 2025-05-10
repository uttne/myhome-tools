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


from myhome_tools.api.v1 import root, me, shopping, ns


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

app.include_router(root.router)
app.include_router(me.router)
app.include_router(ns.router)
app.include_router(shopping.router)

@app.post("/api/v1/init")
async def post_init(request: Request):
    auth_header: str | None = request.headers.get("authorization")
    return {"token": auth_header}



handler = Mangum(app)
