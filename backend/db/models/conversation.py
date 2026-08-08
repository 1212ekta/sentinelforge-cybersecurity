import uuid
from datetime import datetime, timezone
from typing import List
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class ConversationModel(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="New Chat")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    messages: Mapped[List["MessageModel"]] = relationship(
        "MessageModel", back_populates="conversation", cascade="all, delete-orphan", order_by="MessageModel.created_at"
    )
    analyses: Mapped[List["AnalysisModel"]] = relationship("AnalysisModel", back_populates="conversation")
