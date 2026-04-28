from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Leaf Diagnosis API"
    api_prefix: str = "/api"
    secret_key: str = "change_me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/leaf_diagnosis"

    plantnet_api_key: str = ""
    plantnet_api_url: str = "https://my-api.plantnet.org/v2/identify"
    plantnet_project: str = "all"
    plantnet_diseases_url: str = "https://my-api.plantnet.org/v2/diseases/identify"

    ollama_url: str = "http://localhost:11434/api/generate"
    ollama_model: str = "qwen2.5:7b"
    qwen_model: str = "qwen2.5:7b"

    upload_dir: str = "uploads"
    max_file_size_mb: int = 5
    confidence_threshold: float = 0.6
    log_level: str = "INFO"
    auto_create_tables: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
