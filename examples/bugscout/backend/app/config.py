import os

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Solari Sentinel"
    app_version: str = "1.0.0"
    app_env: str = "development"
    debug: bool = True

    # Solari Cloud Platform
    solari_api_key: str | None = Field(default_factory=lambda: os.getenv("SOLARI_API_KEY"))
    solari_base_url: str = Field(default="https://api.getsolari.com")
    solari_browser_stealth: bool = True
    solari_browser_proxy: str = "us"
    solari_browser_record: bool = True
    solari_sandbox_timeout_ms: int = 5 * 60_000

    # LLM Settings (Google Gemini / OpenAI / Anthropic)
    gemini_api_key: str | None = Field(
        default_factory=lambda: os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    )
    gemini_model: str = Field(default="gemini-3.5-flash-lite")
    openai_api_key: str | None = Field(default_factory=lambda: os.getenv("OPENAI_API_KEY"))
    openai_model: str = Field(default="gpt-4o")
    anthropic_api_key: str | None = Field(default_factory=lambda: os.getenv("ANTHROPIC_API_KEY"))
    anthropic_model: str = Field(default="claude-3-7-sonnet-20250219")

    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
