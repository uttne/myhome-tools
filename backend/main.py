from fastapi import FastAPI, Query
from mangum import Mangum
from pydantic import BaseModel

app = FastAPI()

@app.get("/api")
async def get_root():
    return {"msg": "Hello World"}

@app.get("/api/v1/me")
async def get_me():
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
