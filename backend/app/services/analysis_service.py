from __future__ import annotations

import logging
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.models.analysis import Analysis
from app.models.result import Result
from app.services.qwen_service import run_qwen_analysis
from app.services.model_validation import validate_model_result
from app.services.plantnet_service import get_disease_candidates, identify_from_upload
from app.services.result_formatter import (
    STATUS_MAP,
    build_plantnet_preliminary_comment,
    score_to_percent,
    normalize_qwen_result,
)
from app.services.symptom_processing import normalize_selected_symptoms

logger = logging.getLogger(__name__)


def _diseases_top3_for_storage(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Persist PlantNet disease candidates as {name, confidence} only (0..1)."""
    out: list[dict[str, Any]] = []
    for row in rows:
        if len(out) >= 3:
            break
        name = str(row.get("name", "") or "").strip()
        if not name or name.lower() == "unknown":
            continue
        raw = row.get("confidence", row.get("score", 0.0))
        try:
            confidence = float(raw or 0.0)
        except (TypeError, ValueError):
            confidence = 0.0
        confidence = min(1.0, max(0.0, confidence))
        out.append({"name": name, "confidence": confidence})
    return out


def _top_diseases_for_api(stored: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Backward-compatible shape for identify-plant HTTP response and Result UI."""
    api_rows: list[dict[str, Any]] = []
    for row in stored:
        c = float(row.get("confidence", 0.0) or 0.0)
        api_rows.append(
            {
                "name": str(row.get("name", "")),
                "score": c,
                "probability_percent": int(round(c * 100)),
            }
        )
    return api_rows


async def identify_plant_pipeline(db: Session, user_id: int | None, file: UploadFile) -> dict[str, Any]:
    plant, image_path = await identify_from_upload(file)
    disease_scan = get_disease_candidates(image_path)
    top_diseases = disease_scan.get("top_diseases", [])
    diseases_top3_stored = _diseases_top3_for_storage(top_diseases)
    diseases_fallback_text = (
        "По фото сложно определить состояние растения" if not diseases_top3_stored else ""
    )
    plant_name = str(plant.get("plant_name", "unknown"))
    plant_confidence = float(plant.get("confidence", 0.0))
    preliminary_status, preliminary_comment = build_plantnet_preliminary_comment(plant_confidence)

    analysis = Analysis(user_id=user_id, image_path=image_path, created_at=datetime.now(timezone.utc))
    db.add(analysis)
    db.flush()

    payload = {
        "stage": "identify_plant",
        "plantnet": {
            "plant_name": plant_name,
            "plant_confidence": plant_confidence,
            "preliminary_status": preliminary_status,
            "preliminary_comment": preliminary_comment,
            "diseases_raw": disease_scan.get("raw", {}),
            "diseases_top3": diseases_top3_stored,
            "diseases_fallback_text": diseases_fallback_text,
        },
        "symptoms": None,
        "model": None,
    }

    result = Result(
        analysis_id=analysis.id,
        plant_name=plant_name,
        plant_confidence=plant_confidence,
        health_status="uncertain",
        health_confidence=0.0,
        analysis_payload_json=payload,
        recommendations_text=None,
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    top_diseases_response = _top_diseases_for_api(diseases_top3_stored)

    return {
        "analysis_id": analysis.id,
        "plant_name": plant_name,
        "plant_confidence": plant_confidence,
        "plant_confidence_percent": score_to_percent(plant_confidence),
        "preliminary_status": preliminary_status,
        "preliminary_comment": preliminary_comment,
        "top_diseases": top_diseases_response,
        "diseases_fallback_text": diseases_fallback_text,
        "analysis_json": result.analysis_payload_json,
        "created_at": result.created_at,
    }


async def analyze_symptoms_pipeline(
    db: Session,
    user_id: int | None,
    analysis_id: int,
    selected_symptoms: list[str],
    affected_area: str,
) -> dict[str, Any]:
    query = (
        db.query(Analysis, Result)
        .join(Result, Result.analysis_id == Analysis.id)
        .filter(Analysis.id == analysis_id)
    )
    if user_id is not None:
        query = query.filter(Analysis.user_id == user_id)
    row = query.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")

    _analysis, result = row
    symptoms_ru = normalize_selected_symptoms(selected_symptoms, affected_area)
    plantnet_result = (result.analysis_payload_json or {}).get("plantnet", {})

    model_raw = await run_qwen_analysis(
        plant_name=result.plant_name,
        symptoms_ru=symptoms_ru,
        diseases_top3=(plantnet_result or {}).get("diseases_top3") or (plantnet_result or {}).get("top_diseases") or [],
    )
    validation = validate_model_result(
        selected_symptoms=selected_symptoms,
        model_result=model_raw,
        plantnet_result=plantnet_result,
    )

    validated_model = dict(model_raw)
    validated_model["status"] = validation["final_status"]
    validated_model["confidence"] = validation["confidence"]

    model_result_ru = normalize_qwen_result(validated_model)

    payload = deepcopy(result.analysis_payload_json or {})
    plantnet_snapshot = deepcopy(payload.get("plantnet") or {})
    payload["symptoms"] = {
        "selected_symptoms_ru": selected_symptoms,
        "affected_area_ru": affected_area,
    }
    payload["model"] = {
        "raw": model_raw,
        "validated": validated_model,
        "validation": validation,
        "ru": model_result_ru,
    }
    payload["plantnet"] = plantnet_snapshot

    result.health_status = validation["final_status"]
    result.health_confidence = model_result_ru["confidence"]
    result.recommendations_text = "\n".join(f"- {x}" for x in model_result_ru["recommendations"])
    result.analysis_payload_json = payload
    flag_modified(result, "analysis_payload_json")

    db.add(result)
    db.commit()
    db.refresh(result)

    comment = validation["override_note"] or model_result_ru["comment"]

    return {
        "analysis_id": analysis_id,
        "plant_name": result.plant_name,
        "plant_confidence_percent": score_to_percent(result.plant_confidence),
        "final_status": STATUS_MAP[validation["final_status"]],
        "confidence": model_result_ru["confidence"],
        "confidence_percent": model_result_ru["confidence_percent"],
        "possible_causes": model_result_ru["possible_causes"],
        "recommendations": model_result_ru["recommendations"],
        "comment": comment,
        "status_adjusted": validation["overridden"],
        "raw_model_result": model_raw,
        "selected_symptoms": selected_symptoms,
        "affected_area": affected_area,
        "analysis_json": result.analysis_payload_json,
    }
