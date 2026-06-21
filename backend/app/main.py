from fastapi import APIRouter, Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from app.auth import (
    authenticate_local_user,
    clear_auth_cookie,
    get_current_user,
    set_auth_cookie,
    set_user_password,
)
from app.config import get_settings
from app.db import check_database, get_session
from app.models import User
from app.schemas import (
    LoginRequest,
    LogoutResponse,
    MessageResponse,
    PasswordChangeRequest,
    UserRead,
)
from app.security import verify_password

settings = get_settings()

app = FastAPI(title=settings.app_name)
api_v1 = APIRouter(prefix="/api/v1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz", response_model=MessageResponse)
def healthz() -> MessageResponse:
    return MessageResponse(message="ok")


@app.get("/readyz", response_model=MessageResponse)
def readyz() -> MessageResponse:
    check_database()
    return MessageResponse(message="ok")


@api_v1.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@api_v1.post("/auth/login", response_model=UserRead)
def login(
    payload: LoginRequest,
    response: Response,
    session: Session = Depends(get_session),
) -> User:
    user = authenticate_local_user(session, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    set_auth_cookie(response, user.email)
    return user


@api_v1.post("/auth/logout", response_model=LogoutResponse)
def logout(response: Response) -> LogoutResponse:
    clear_auth_cookie(response)
    logout_url = settings.external_logout_url.strip() or None
    return LogoutResponse(message="logged out", logout_url=logout_url)


@api_v1.post("/auth/password", response_model=UserRead)
def change_password(
    payload: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> User:
    if current_user.password_hash:
        if not payload.current_password or not verify_password(
            payload.current_password, current_user.password_hash
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is invalid",
            )

    return set_user_password(session, current_user, payload.new_password)


app.include_router(api_v1)
