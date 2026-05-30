from datetime import UTC, datetime
from enum import StrEnum
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


class UserRole(StrEnum):
    ADMIN = "admin"
    USER = "user"


class AuthProvider(StrEnum):
    CLOUDFLARE = "cloudflare"
    LOCAL = "local"


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str | None = None
    display_name: str | None = None
    role: UserRole = Field(default=UserRole.USER)
    auth_provider: AuthProvider = Field(default=AuthProvider.LOCAL)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
