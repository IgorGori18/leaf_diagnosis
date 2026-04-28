from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_optional_user
from app.db import get_db
from app.models.user import User
from app.schemas.analysis import IdentifyPlantResponse
from app.services.analysis_service import identify_plant_pipeline

router = APIRouter(tags=["analysis-flow"])


@router.post("/identify-plant", response_model=IdentifyPlantResponse)
async def identify_plant(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    user_id = current_user.id if current_user else None
    payload = await identify_plant_pipeline(db, user_id, file)
    return IdentifyPlantResponse(**payload)
