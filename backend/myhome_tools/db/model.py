"""
SQLModel 2.x で生成した “app” / “ns” スキーマのモデル定義
"""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional, List

from sqlalchemy import Column, String, Boolean, ForeignKey, Integer
from sqlmodel import Field, Relationship, SQLModel


# ────────────────────────────────────────────────────────────────
#  util: 共通で使う型エイリアス
# ────────────────────────────────────────────────────────────────
ID = str  # varchar 主キー


# ════════════════════════════════════════════════════════════════
#                          app スキーマ
# ════════════════════════════════════════════════════════════════
class AppUser(SQLModel, table=True):
    __tablename__ = "users"
    __table_args__ = {"schema": "app"}

    id: ID = Field(sa_column=Column(String, primary_key=True))
    name: str = Field(sa_column=Column(String, unique=True, nullable=False))
    email: str

    # relations
    namespaces: List["AppNamespace"] = Relationship(back_populates="owner")
    member_of: List["AppNamespaceUser"] = Relationship(back_populates="user")


class AppNamespace(SQLModel, table=True):
    __tablename__ = "namespaces"
    __table_args__ = {"schema": "app"}

    id: ID = Field(sa_column=Column(String, primary_key=True))
    name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    owner_id: ID = Field(
        sa_column=Column(String, ForeignKey("app.users.id", ondelete="CASCADE"))
    )

    # relations
    owner: Optional[AppUser] = Relationship(back_populates="namespaces")
    members: List["AppNamespaceUser"] = Relationship(back_populates="namespace")


class NamespaceUserRole(str, Enum):
    read = "read"
    write = "write"
    admin = "admin"


class AppNamespaceUser(SQLModel, table=True):
    __tablename__ = "namespace_users"
    __table_args__ = {"schema": "app"}

    id: ID = Field(sa_column=Column(String, primary_key=True))
    namespace_id: ID = Field(
        sa_column=Column(String, ForeignKey("app.namespaces.id", ondelete="CASCADE"))
    )
    user_id: ID = Field(
        sa_column=Column(String, ForeignKey("app.users.id", ondelete="CASCADE"))
    )
    role: NamespaceUserRole

    # relations
    namespace: Optional[AppNamespace] = Relationship(back_populates="members")
    user: Optional[AppUser] = Relationship(back_populates="member_of")


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
    name: str
    extension: str
    size: int
    type: NsAssetType
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    namespace_id: ID = Field(
        sa_column=Column(String, ForeignKey("app.namespaces.id", ondelete="CASCADE"))
    )


class NsShoppingItemMasterIcon(SQLModel, table=True):
    __tablename__ = "shopping_item_master_icons"
    __table_args__ = {"schema": "ns"}

    id: ID = Field(sa_column=Column(String, primary_key=True))
    type: ShoppingItemMasterIconType
    value: str
    asset_id: Optional[ID] = Field(
        sa_column=Column(String, ForeignKey("ns.assets.id"), nullable=True)
    )
    created_at: datetime
    updated_at: datetime
    namespace_id: ID = Field(
        sa_column=Column(String, ForeignKey("app.namespaces.id", ondelete="CASCADE"))
    )


class NsShoppingItemMaster(SQLModel, table=True):
    __tablename__ = "shopping_item_masters"
    __table_args__ = {"schema": "ns"}

    id: ID = Field(sa_column=Column(String, primary_key=True))
    name: str
    description: Optional[str] = None
    icon_id: Optional[ID] = Field(
        sa_column=Column(String, ForeignKey("ns.shopping_item_master_icons.id"))
    )
    created_at: datetime
    updated_at: datetime
    archived_at: Optional[datetime] = None
    namespace_id: ID = Field(
        sa_column=Column(String, ForeignKey("app.namespaces.id", ondelete="CASCADE"))
    )


class NsShoppingList(SQLModel, table=True):
    __tablename__ = "shopping_lists"
    __table_args__ = {"schema": "ns"}

    id: ID = Field(sa_column=Column(String, primary_key=True))
    name: str
    description: Optional[str] = None
    is_default: bool = Field(sa_column=Column(Boolean, default=False))
    created_at: datetime
    updated_at: datetime
    archived_at: Optional[datetime] = None
    namespace_id: ID = Field(
        sa_column=Column(String, ForeignKey("app.namespaces.id", ondelete="CASCADE"))
    )

    # items relation
    items: List["NsShoppingListItem"] = Relationship(back_populates="shopping_list")


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
