import os
import tempfile
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "KisanVerify"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "sqlite:///./kisanverify.db"
    
    SECRET_KEY: str = "kisanverify-demo-secret-key-32-chars-minimum-prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    LLM_PROVIDER: str = "gemini"
    LLM_MODEL: str = "gemini-1.5-flash"
    
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    @field_validator("DATABASE_URL", mode="before")
    def assemble_database_url(cls, v):
        # On Vercel, AWS Lambda or serverless container, use system temp directory for writable SQLite
        if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
            if not v or v == "sqlite:///./kisanverify.db":
                temp_dir = tempfile.gettempdir()
                db_path = os.path.join(temp_dir, "kisanverify.db").replace("\\", "/")
                return f"sqlite:///{db_path}"
        return v

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
