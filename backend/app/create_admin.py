import os

from sqlmodel import Session

from app.auth import create_user, get_user_by_email
from app.db import engine
from app.models import AuthProvider, UserRole


def main() -> None:
    email = os.environ.get("ADMIN_EMAIL")
    password = os.environ.get("ADMIN_PASSWORD")
    if not email or not password:
        raise SystemExit("ADMIN_EMAIL and ADMIN_PASSWORD are required")

    with Session(engine) as session:
        existing = get_user_by_email(session, email)
        if existing:
            print(f"Admin already exists: {existing.email}")
            return

        user = create_user(
            session,
            email=email,
            password=password,
            auth_provider=AuthProvider.LOCAL,
            role=UserRole.ADMIN,
        )
        print(f"Created admin user: {user.email}")


if __name__ == "__main__":
    main()
