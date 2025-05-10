from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter()

# ════════════════════════════════════════════════════════════════
# 買い物リストの全体のアイテムについて
class Item(BaseModel):
    name: str

@router.get("/api/v1/ns/{namespace_id}/shopping/items")
async def get_shopping_items(namespace_id: str):
    return {"items": ["apple", "banana", "cherry"]}


@router.post("/api/v1/ns/{namespace_id}/shopping/items")
async def put_shopping_items(namespace_id: str, item: Item):
    return {"items": ["apple", "banana", "cherry"]}


@router.delete("/api/v1/ns/{namespace_id}/shopping/items/{item_id}")
async def delete_shopping_items(namespace_id: str, item_id: str):
    return {"items": ["apple", "banana", "cherry"]}


@router.patch("/api/v1/ns/{namespace_id}/shopping/items/{item_id}")
async def change_shopping_items(namespace_id: str, item_id: str):
    return {"items": ["apple", "banana", "cherry"]}

# ════════════════════════════════════════════════════════════════
# 買い物リストについて

@router.get("/api/v1/ns/{namespace_id}/shopping/lists")
async def get_shopping_lists(namespace_id: str):
    return {"items": ["apple", "banana", "cherry"]}


@router.post("/api/v1/ns/{namespace_id}/shopping/lists")
async def create_shopping_list(namespace_id: str):
    return {"items": ["apple", "banana", "cherry"]}


@router.delete("/api/v1/ns/{namespace_id}/shopping/lists/{list_id}")
async def delete_shopping_list(namespace_id: str):
    return {"items": ["apple", "banana", "cherry"]}


# ════════════════════════════════════════════════════════════════
# 買い物リストのアイテムについて

@router.get("/api/v1/ns/{namespace_id}/shopping/lists/{list_id}/items")
async def get_shopping_list_items(namespace_id: str):
    return {"items": ["apple", "banana", "cherry"]}

@router.post("/api/v1/ns/{namespace_id}/shopping/lists/{list_id}/items")
async def create_shopping_list_items(namespace_id: str, item_id: str):
    return {"items": ["apple", "banana", "cherry"]}

@router.delete("/api/v1/ns/{namespace_id}/shopping/lists/{list_id}/items/{item_id}")
async def delete_shopping_list_items(namespace_id: str, item_id: str):
    return {"items": ["apple", "banana", "cherry"]}

@router.patch("/api/v1/ns/{namespace_id}/shopping/lists/{list_id}/items/{item_id}")
async def change_shopping_list_items(namespace_id: str, item_id: str):
    return {"items": ["apple", "banana", "cherry"]}


# ════════════════════════════════════════════════════════════════
# namespace に紐づく画像について

@router.get("/api/v1/ns/{namespace_id}/shopping/images")
async def get_shopping_images(namespace_id: str):
    return {"items": [{"id":"", "name": "", "url": ""}]}

@router.post("/api/v1/ns/{namespace_id}/shopping/images")
async def put_shopping_images(namespace_id: str):
    return {"items": [{"id":"", "name": "", "url": ""}]}


@router.delete("/api/v1/ns/{namespace_id}/shopping/images/{image_id}")
async def delete_shopping_images(namespace_id: str, image_id: str):
    return {"items": ["apple", "banana", "cherry"]}

# ════════════════════════════════════════════════════════════════
# 買い物の履歴を取得する


@router.get("/api/v1/ns/{namespace_id}/shopping/histories")
async def get_shopping_histories(namespace_id: str, _from: str = Query(alias="from"), to: str = Query()):
    return {"from": _from, "to": to}
