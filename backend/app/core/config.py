from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "IndiaMedicare AI"
    app_env: str = "development"
    app_port: int = 8000
    frontend_origin: str = "http://localhost:5173"

    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db_name: str = "indiamedicare_ai"

    jwt_secret: str = "change_me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 120

    openai_api_key: str | None = None
    openai_embed_model: str = "text-embedding-3-small"
    openai_chat_model: str = "gpt-4o-mini"

    tavily_api_key: str | None = None
    tavily_base_url: str = "https://api.tavily.com/search"

    groq_api_key: str | None = None

    rate_limit_default: str = "60/minute"

    dataset_path: str = "./data/VF_Hackathon_Dataset_India_Large.xlsx"
    faiss_index_path: str = "./data/hospital.index"
    faiss_meta_path: str = "./data/hospital_meta.json"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


@lru_cache
def get_settings() -> Settings:
    return Settings()
