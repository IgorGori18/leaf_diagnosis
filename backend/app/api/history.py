import os

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db import get_db
from app.models.analysis import Analysis
from app.models.result import Result
from app.models.user import User
from app.schemas.history import HistoryDetail, HistoryItem

router = APIRouter(prefix="/history", tags=["history"])


def _image_url(path: str) -> str:
    """Convert absolute filesystem path to a browser-accessible URL."""
    if not path:
        return path
    filename = os.path.basename(path)
    return f"/uploads/{filename}"


def _display_status(value: str) -> str:
    key = (value or "").strip().lower()
    if key in {"healthy", "здоровое"}:
        return "Признаки проблемы не выявлены"
    if key in {"diseased", "есть признаки проблемы"}:
        return "Есть признаки проблемы"
    if key in {"uncertain", "недостаточно данных"}:
        return "Недостаточно данных"
    return "Недостаточно данных"


@router.get("", response_model=list[HistoryItem])
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = (
        db.query(Analysis, Result)
        .join(Result, Result.analysis_id == Analysis.id)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )
    return [
        HistoryItem(
            analysis_id=analysis.id,
            image_path=_image_url(analysis.image_path),
            plant_name=result.plant_name,
            plant_confidence=result.plant_confidence,
            final_status=result.health_status,
            final_confidence=result.health_confidence,
            display_status=_display_status(result.health_status),
            created_at=analysis.created_at,
        )
        for analysis, result in rows
    ]


@router.get("/{analysis_id}", response_model=HistoryDetail)
def get_history_item(
    analysis_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    row = (
        db.query(Analysis, Result)
        .join(Result, Result.analysis_id == Analysis.id)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")

    analysis, result = row
    return HistoryDetail(
        analysis_id=analysis.id,
        image_path=_image_url(analysis.image_path),
        created_at=analysis.created_at,
        result={
            "plant_name": result.plant_name,
            "plant_confidence": result.plant_confidence,
            "final_status": result.health_status,
            "final_confidence": result.health_confidence,
            "display_status": _display_status(result.health_status),
            "analysis_json": result.analysis_payload_json,
            "recommendations_text": result.recommendations_text,
        },
    )
