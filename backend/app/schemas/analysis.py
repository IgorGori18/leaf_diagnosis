from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

AFFECTED_AREAS_RU = ["Нижние листья", "Верхние листья", "Всё растение"]


class SymptomOption(BaseModel):
    id: str
    label: str


class IdentifyPlantResponse(BaseModel):
    analysis_id: int
    plant_name: str
    plant_confidence: float
    plant_confidence_percent: float
    preliminary_status: str
    preliminary_comment: str
    top_diseases: list[dict[str, Any]] = Field(default_factory=list)
    diseases_fallback_text: str = ""
    analysis_json: dict[str, Any]
    created_at: datetime


class AnalyzeSymptomsRequest(BaseModel):
    analysis_id: int
    selected_symptoms: list[str] = Field(default_factory=list)
    affected_area: Literal["Нижние листья", "Верхние листья", "Всё растение"]


class AnalyzeSymptomsResponse(BaseModel):
    analysis_id: int
    plant_name: str
    plant_confidence_percent: float
    final_status: str
    confidence: float
    confidence_percent: float
    possible_causes: list[str]
    recommendations: list[str]
    comment: str
    status_adjusted: bool = False
    raw_model_result: dict[str, Any] = Field(default_factory=dict)
    selected_symptoms: list[str] = Field(default_factory=list)
    affected_area: str = ""
    analysis_json: dict[str, Any]


class SymptomCatalogResponse(BaseModel):
    symptoms: list[SymptomOption]
    affected_areas: list[str]
