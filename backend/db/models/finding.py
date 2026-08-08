import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class FindingModel(Base):
    __tablename__ = "findings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"fnd_{uuid.uuid4().hex[:8]}")
    analysis_id: Mapped[str] = mapped_column(String, ForeignKey("analyses.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    evidence: Mapped[str] = mapped_column(Text, nullable=False)
    impact: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[str] = mapped_column(String(20), default="HIGH")
    source_file: Mapped[str] = mapped_column(String(255), nullable=False)
    line_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    cwe_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    cve_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    analysis: Mapped["AnalysisModel"] = relationship("AnalysisModel", back_populates="findings")
