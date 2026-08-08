import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class ReportModel(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"rpt_{uuid.uuid4().hex[:8]}")
    analysis_id: Mapped[str] = mapped_column(String, ForeignKey("analyses.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    format: Mapped[str] = mapped_column(String(20), default="markdown")
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    analysis: Mapped["AnalysisModel"] = relationship("AnalysisModel", back_populates="reports")
