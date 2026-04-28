from pathlib import Path
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.core.config import settings


def _latin_name_only(value: str) -> str:
    text = str(value or "").strip()
    if " - " in text:
        return text.split(" - ")[0].strip()
    return text


def _is_unknown_value(value: str) -> bool:
    return (value or "").strip().lower() in {"", "unknown", "null", "none"}


async def identify_plant(image_bytes: bytes, filename: str) -> dict[str, Any]:
    if not settings.plantnet_api_key:
        return {"plant_name": "unknown", "confidence": 0.0}

    url = f"{settings.plantnet_api_url.rstrip('/')}/{settings.plantnet_project}"
    params = {"api-key": settings.plantnet_api_key}
    files = {"images": (filename, image_bytes, "image/jpeg")}

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, params=params, files=files)
            response.raise_for_status()
            payload = response.json()
    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail=f"PlantNet identify timeout: {exc}"
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail=f"PlantNet identify API error: {exc}"
        ) from exc

    results = payload.get("results", [])
    if not results:
        return {"plant_name": "unknown", "confidence": 0.0}

    best = results[0]
    species = best.get("species", {})
    scientific_name = species.get("scientificNameWithoutAuthor", "unknown")
    confidence = float(best.get("score", 0.0))
    return {"plant_name": scientific_name, "confidence": confidence}


def _to_disease_label(item: dict[str, Any]) -> str:
    disease = item.get("disease", {}) or {}
    candidates = [
        disease.get("scientificName"),
        item.get("label"),
        disease.get("description"),
        item.get("description"),
        (disease.get("commonNames") or [None])[0],
    ]
    for candidate in candidates:
        normalized = _latin_name_only(str(candidate))
        if not _is_unknown_value(normalized):
            return normalized
    return "unknown"


def _extract_top_diseases(payload: dict[str, Any], limit: int = 3) -> list[dict[str, Any]]:
    results = payload.get("results", [])
    if not results:
        return []

    candidates: list[dict[str, Any]] = []
    for item in results:
        score = float(item.get("score", 0.0) or 0.0)
        candidates.append(
            {
                "name": _to_disease_label(item),
                "score": score,
                "probability_percent": int(round(score * 100)),
            }
        )

    candidates.sort(key=lambda x: float(x["score"]), reverse=True)
    return candidates[:limit]


def identify_diseases(image_path: str) -> dict[str, Any]:
    if not settings.plantnet_api_key:
        return {"raw": {"results": []}, "top_diseases": []}

    path = Path(image_path)
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image file not found")

    params = {"api-key": settings.plantnet_api_key}
    with path.open("rb") as file_obj:
        files = {"images": (path.name, file_obj, "image/jpeg")}
        data = {"organs": "leaf"}
        try:
            response = httpx.post(
                settings.plantnet_diseases_url, params=params, files=files, data=data, timeout=30
            )
            response.raise_for_status()
            payload = response.json()
        except httpx.TimeoutException as exc:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail=f"PlantNet disease timeout: {exc}",
            ) from exc
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"PlantNet disease API error: {exc}",
            ) from exc

    return {"raw": payload, "top_diseases": _extract_top_diseases(payload)}
