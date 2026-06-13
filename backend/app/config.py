from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "myhome-tools"
    database_url: str = Field(
        default="postgresql+psycopg://myhome:myhome@localhost:5432/myhome_tools"
    )
    frontend_origin: str = "http://localhost:5173"
    jwt_secret_key: str = "change-me-in-local-env"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    auth_cookie_name: str = "myhome_access_token"
    secure_cookies: bool = False
    allowed_cloudflare_emails: str = ""
    external_logout_url: str = ""

    @property
    def allowed_cloudflare_email_set(self) -> set[str]:
        return {
            email.strip().lower()
            for email in self.allowed_cloudflare_emails.split(",")
            if email.strip()
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()
