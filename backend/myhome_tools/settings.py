from functools import lru_cache
from pathlib import Path
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from uuid import UUID


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        env_prefix="MYHOME_TOOLS_",
    )

    # DB
    db_dir: Path = Field(default=Path(".") / Path("db"), validation_alias="DB_DIR")
    db_name_app: str = Field(default="app.db", validation_alias="DB_NAME_APP")
    db_alias_app: Literal["app"] = Field(
        default="app", validation_alias="DB_ALIAS_APP"
    )  # DB のエイリアス名
    db_alias_ns: Literal["ns"] = Field(
        default="ns", validation_alias="DB_ALIAS_NS"
    )  # DB のエイリアス名

    def get_ns_db_data_dir(self) -> Path:
        """
        DB データの保存先ディレクトリを取得する
        """
        return self.db_dir / self.db_alias_ns
    
    def get_app_db_path(self) -> Path:
        """
        DB のパスを取得する
        """
        return self.db_dir / self.db_name_app
    
    def get_ns_db_path(self, ns_id: UUID | str, *, ensure_dir: bool = True) -> Path:
        """
        DB のパスを取得する
        """
        if isinstance(ns_id, str):
            ns_id = UUID(ns_id)
        d = self.get_ns_db_data_dir() / ns_id.hex[:2]
        n = f"{ns_id.hex[2:]}.db"

        if ensure_dir:
            d.mkdir(parents=True, exist_ok=True)
        return d / n
    


@lru_cache
def get_settings() -> Settings:
    """
    環境変数から設定を取得する
    """
    return Settings()
