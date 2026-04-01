import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / ".env")


def _resolve_database_uri() -> str:
    raw_uri = os.getenv("DATABASE_URL")
    if not raw_uri:
        return f"sqlite:///{(BASE_DIR / 'database' / 'app.db').resolve()}"

    if raw_uri.startswith("sqlite:///"):
        sqlite_path = raw_uri.replace("sqlite:///", "", 1)
        path_obj = Path(sqlite_path)
        if not path_obj.is_absolute():
            path_obj = (BASE_DIR.parent / path_obj).resolve()
        return f"sqlite:///{path_obj}"

    return raw_uri


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-too")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv("JWT_EXPIRY_HOURS", "8")))
    SQLALCHEMY_DATABASE_URI = _resolve_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    CHAT_MODEL = os.getenv("CHAT_MODEL", "gpt-4o-mini")
    UPLOAD_FOLDER = str(BASE_DIR / "data" / "uploads")
    VECTOR_STORE_PATH = str(BASE_DIR / "data" / "faiss_index" / "college_index")
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024
    ALLOWED_EXTENSIONS = {"pdf"}
    CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]
