from __future__ import annotations

import os
import uuid
from pathlib import Path
from typing import Any

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings
from app.providers.plantnet_provider import identify_diseases, identify_plant

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}


def validate_image(file: UploadFile, raw: bytes) -> None:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported image type")
    max_size = settings.max_file_size_mb * 1024 * 1024
    if len(raw) > max_size:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is too large")


def save_image(file: UploadFile, raw: bytes) -> str:
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    path = Path(settings.upload_dir) / filename
    path.write_bytes(raw)
    return str(path)


async def identify_from_upload(file: UploadFile) -> tuple[dict[str, Any], str]:
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file")
    validate_image(file, raw)
    image_path = save_image(file, raw)
    plant = await identify_plant(raw, file.filename or "leaf.jpg")
    return plant, image_path


def get_disease_candidates(image_path: str) -> dict[str, Any]:
    return identify_diseases(image_path)
