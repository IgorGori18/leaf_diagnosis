from datetime import datetime
from typing import Any

from pydantic import BaseModel


class HistoryItem(BaseModel):
    analysis_id: int
    image_path: str
    plant_name: str
    plant_confidence: float
    final_status: str
    final_confidence: float
    display_status: str
    created_at: datetime


class HistoryDetail(BaseModel):
    analysis_id: int
    image_path: str
    created_at: datetime
    result: dict[str, Any]
