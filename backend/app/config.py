from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Configuration de l'application"""
    
    # Database
    DATABASE_URL: str = "postgresql://admin:secure_password@postgres:5432/oil_data"
    
    # API
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = "Oil Data Aggregation API"
    DEBUG: bool = True
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
