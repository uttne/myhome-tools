from fastapi import FastAPI, Request
from mangum import Mangum
from pathlib import Path

# テーブルの定義の読み込み
from myhome_tools.db.engine import init_db, get_engine, get_async_session
from fastapi.openapi.utils import get_openapi


from myhome_tools.api.v1 import root, me, shopping, ns


DB_DIR = Path(".") / Path("db")
DB_DATA_DIR = DB_DIR / "data"

DB_DIR.mkdir(parents=True, exist_ok=True)
DB_DATA_DIR.mkdir(parents=True, exist_ok=True)
# ════════════════════════════════════════════════════════════════

async def lifespan(app: FastAPI):
    async with get_async_session() as session:
        # startup
        # DB の初期化処理
        await init_db(session, DB_DIR / "app.db", "app")
        yield
    
    # shutdown
    await get_engine().dispose()


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
