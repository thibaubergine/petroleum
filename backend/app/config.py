from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List
import json
import os

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://admin:secure_password@postgres:5432/oil_data"
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = "Oil Data Aggregation API"
    DEBUG: bool = False

    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        raw = os.getenv("BACKEND_CORS_ORIGINS", '["http://localhost:5173","http://localhost:3000"]')
        try:
            return json.loads(raw)
        except Exception:
            return [raw]

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
