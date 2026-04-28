from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Result(Base):
    __tablename__ = "results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    analysis_id: Mapped[int] = mapped_column(
        ForeignKey("analyses.id"), nullable=False, unique=True, index=True
    )
    plant_name: Mapped[str] = mapped_column(String(255), nullable=False)
    plant_confidence: Mapped[float] = mapped_column(Float, nullable=False)
    health_status: Mapped[str] = mapped_column(String(50), nullable=False)
    health_confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    analysis_payload_json: Mapped[dict] = mapped_column("llm_response_json", JSON, nullable=False)
    recommendations_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    analysis = relationship("Analysis", back_populates="result")
