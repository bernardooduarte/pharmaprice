from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql://pharmaprice:pharmaprice@localhost:5432/pharmaprice"

    class Config:
        env_file = ".env"

settings = Settings()