from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models import AuthProvider, UserRole


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    display_name: str | None
    role: UserRole
    auth_provider: AuthProvider


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PasswordChangeRequest(BaseModel):
    current_password: str | None = None
    new_password: str


class MessageResponse(BaseModel):
    message: str


class LogoutResponse(MessageResponse):
    logout_url: str | None = None
