"""
SQLModel 2.x で生成した “app” / “ns” スキーマのモデル定義
"""
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Column, String, Boolean, ForeignKey, Integer
from sqlmodel import Field, Relationship, SQLModel


# ────────────────────────────────────────────────────────────────
#  util: 共通で使う型エイリアス
# ────────────────────────────────────────────────────────────────
ID = str  # varchar 主キー


# ════════════════════════════════════════════════════════════════
#                          ns スキーマ
# ════════════════════════════════════════════════════════════════
class ShoppingItemMasterIconType(str, Enum):
    emoji = "emoji"
    image = "image"


class NsAssetType(str, Enum):
    image = "image"


class NsAsset(SQLModel, table=True):
    __tablename__ = "assets"
    __table_args__ = {"schema": "ns"}

    id: ID = Field(sa_column=Column(String, primary_key=True))
    name: str = Field(sa_column=Column(String, nullable=False))
    extension: str = Field(sa_column=Column(String, nullable=False))
    size: int = Field(sa_column=Column(Integer, default=0))
    type: NsAssetType
    description: Optional[str] = Field(sa_column=Column(String, nullable=True))
    created_at: datetime
    updated_at: datetime
    namespace_id: ID = Field(
        sa_column=Column(String)
    )


class NsShoppingItemMasterIcon(SQLModel, table=True):
    __tablename__ = "shopping_item_master_icons"
    __table_args__ = {"schema": "ns"}

    id: ID = Field(sa_column=Column(String, primary_key=True))
    type: ShoppingItemMasterIconType
    value: str = Field(sa_column=Column(String, nullable=False))
    asset_id: Optional[ID] = Field(
        sa_column=Column(String, ForeignKey("ns.assets.id"), nullable=True)
    )
    created_at: datetime
    updated_at: datetime
    namespace_id: ID = Field(
        sa_column=Column(String)
    )


class NsShoppingItemMaster(SQLModel, table=True):
    __tablename__ = "shopping_item_masters"
    __table_args__ = {"schema": "ns"}

    id: ID = Field(sa_column=Column(String, primary_key=True))
    name: str = Field(sa_column=Column(String, nullable=False))
    description: Optional[str] = Field(sa_column=Column(String, nullable=True))
    icon_id: Optional[ID] = Field(
        sa_column=Column(String, ForeignKey("ns.shopping_item_master_icons.id"))
    )
    created_at: datetime
    updated_at: datetime
    archived_at: Optional[datetime] = None
    namespace_id: ID = Field(
        sa_column=Column(String)
    )


class NsShoppingList(SQLModel, table=True):
    __tablename__ = "shopping_lists"
    __table_args__ = {"schema": "ns"}

    id: ID = Field(sa_column=Column(String, primary_key=True))
    name: str = Field(sa_column=Column(String, nullable=False))
    description: Optional[str] = Field(sa_column=Column(String, nullable=True))
    is_default: bool = Field(sa_column=Column(Boolean, default=False))
    created_at: datetime
    updated_at: datetime
    archived_at: Optional[datetime] = None
    namespace_id: ID = Field(
        sa_column=Column(String)
    )

    # items relation
    items: list["NsShoppingListItem"] = Relationship(back_populates="shopping_list")


class NsShoppingListItem(SQLModel, table=True):
    __tablename__ = "shopping_list_items"
    __table_args__ = {"schema": "ns"}

    id: ID = Field(sa_column=Column(String, primary_key=True))
    shopping_list_id: ID = Field(
        sa_column=Column(String, ForeignKey("ns.shopping_lists.id", ondelete="CASCADE"))
    )
    shopping_item_master_id: ID = Field(
        sa_column=Column(
            String, ForeignKey("ns.shopping_item_masters.id", ondelete="CASCADE")
        )
    )
    quantity: int = Field(sa_column=Column(Integer, default=1))
    created_at: datetime
    shopped_at: Optional[datetime] = None

    shopping_list: Optional[NsShoppingList] = Relationship(back_populates="items")
