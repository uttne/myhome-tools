"""
SQLModel 2.x で生成した “app” / “ns” スキーマのモデル定義
"""
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Column, String, ForeignKey
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
    sub: str = Field(sa_column=Column(String, unique=True, nullable=False))
    name: str = Field(sa_column=Column(String, unique=True))
    email: str = Field(sa_column=Column(String, nullable=True))

    # relations
    namespaces: list["AppNamespace"] = Relationship(back_populates="owner")
    member_of: list["AppNamespaceUser"] = Relationship(back_populates="user")


class AppNamespace(SQLModel, table=True):
    __tablename__ = "namespaces"
    __table_args__ = {"schema": "app"}

    id: ID = Field(sa_column=Column(String, primary_key=True))
    name: str = Field(sa_column=Column(String, nullable=False))
    description: Optional[str] = Field(sa_column=Column(String, nullable=True))
    created_at: datetime
    updated_at: datetime
    owner_id: ID = Field(
        sa_column=Column(String, ForeignKey("app.users.id", ondelete="CASCADE"))
    )

    # relations
    owner: Optional["AppUser"] = Relationship(back_populates="namespaces")
    members: list["AppNamespaceUser"] = Relationship(back_populates="namespace")


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
