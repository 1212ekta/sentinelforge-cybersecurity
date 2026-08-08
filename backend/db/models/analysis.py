import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class AnalysisModel(Base):
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"anls_{uuid.uuid4().hex[:8]}")
    conversation_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("conversations.id", ondelete="SET NULL"), nullable=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    analysis_type: Mapped[str] = mapped_column(String(50), default="security_audit")
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)
    processing_time: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    conversation: Mapped[Optional["ConversationModel"]] = relationship("ConversationModel", back_populates="analyses")
    findings: Mapped[List["FindingModel"]] = relationship("FindingModel", back_populates="analysis", cascade="all, delete-orphan")
    reports: Mapped[List["ReportModel"]] = relationship("ReportModel", back_populates="analysis", cascade="all, delete-orphan")
