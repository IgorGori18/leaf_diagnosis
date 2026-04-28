from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_optional_user
from app.db import get_db
from app.models.user import User
from app.schemas.analysis import AnalyzeSymptomsRequest, AnalyzeSymptomsResponse, SymptomCatalogResponse
from app.services.analysis_service import analyze_symptoms_pipeline
from app.services.symptom_processing import AFFECTED_AREAS_RU, SYMPTOM_OPTIONS_RU

router = APIRouter(tags=["analysis-flow"])


@router.get("/symptom-options", response_model=SymptomCatalogResponse)
def get_symptom_options():
    return SymptomCatalogResponse(
        symptoms=[{"id": str(i), "label": s} for i, s in enumerate(SYMPTOM_OPTIONS_RU)],
        affected_areas=AFFECTED_AREAS_RU,
    )


@router.post("/analyze-symptoms", response_model=AnalyzeSymptomsResponse)
async def analyze_symptoms(
    payload: AnalyzeSymptomsRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    user_id = current_user.id if current_user else None
    data = await analyze_symptoms_pipeline(
        db=db,
        user_id=user_id,
        analysis_id=payload.analysis_id,
        selected_symptoms=payload.selected_symptoms,
        affected_area=payload.affected_area,
    )
    return AnalyzeSymptomsResponse(**data)
