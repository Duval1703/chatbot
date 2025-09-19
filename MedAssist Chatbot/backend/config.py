import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://postgres:postgresql@localhost:5432/medichat_ai"
    
    # JWT
    secret_key: str = "your-super-secret-jwt-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Model
    model_path: str = "../model/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
    
    # Translation API (free services)
    translate_api_key: str = ""  # Add your translation API key if needed
    
    class Config:
        env_file = ".env"

settings = Settings()