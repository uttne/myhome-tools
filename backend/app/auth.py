from datetime import UTC, datetime

from fastapi import Depends, Header, HTTPException, Request, Response, status
from sqlmodel import Session, select

from app.config import Settings, get_settings
from app.db import get_session
from app.models import AuthProvider, User, UserRole
from app.security import create_access_token, decode_access_token, hash_password, verify_password


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def get_user_by_email(session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == _normalize_email(email))
    return session.exec(statement).first()


def create_user(
    session: Session,
    *,
    email: str,
    auth_provider: AuthProvider,
    role: UserRole = UserRole.USER,
    password: str | None = None,
) -> User:
    user = User(
        email=_normalize_email(email),
        password_hash=hash_password(password) if password else None,
        auth_provider=auth_provider,
        role=role,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def authenticate_local_user(session: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(session, email)
    if not user or not user.is_active:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def set_auth_cookie(response: Response, email: str) -> None:
    settings = get_settings()
    token = create_access_token(email)
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=token,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(key=settings.auth_cookie_name, path="/")


def _get_or_create_cloudflare_user(
    session: Session, email: str, settings: Settings
) -> User | None:
    normalized_email = _normalize_email(email)
    allowed_emails = settings.allowed_cloudflare_email_set
    if allowed_emails and normalized_email not in allowed_emails:
        return None

    user = get_user_by_email(session, normalized_email)
    if user:
        return user if user.is_active else None

    return create_user(
        session,
        email=normalized_email,
        auth_provider=AuthProvider.CLOUDFLARE,
        role=UserRole.USER,
    )


def get_current_user(
    request: Request,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
    cf_email: str | None = Header(default=None, alias="Cf-Access-Authenticated-User-Email"),
) -> User:
    if cf_email:
        user = _get_or_create_cloudflare_user(session, cf_email, settings)
        if user:
            return user
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cloudflare user denied")

    local_token = request.cookies.get(settings.auth_cookie_name)
    if local_token:
        email = decode_access_token(local_token)
        if email:
            user = get_user_by_email(session, email)
            if user and user.is_active:
                return user

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")


def set_user_password(session: Session, user: User, new_password: str) -> User:
    user.password_hash = hash_password(new_password)
    user.updated_at = datetime.now(UTC)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
