import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import analysis as analysis_routes
from app.api import analyze, auth, history
from app.core.config import settings
from app.db import Base, engine
from app.models import analysis, result, user  # noqa: F401

app = FastAPI(title=settings.app_name)
logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)

if settings.auto_create_tables:
    Base.metadata.create_all(bind=engine)
    logger.warning("AUTO_CREATE_TABLES is enabled. Use Alembic in production.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.allowed_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(analyze.router, prefix=settings.api_prefix)
app.include_router(analysis_routes.router, prefix=settings.api_prefix)
app.include_router(history.router, prefix=settings.api_prefix)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"service": "leaf-diagnosis-api", "status": "ok"}
