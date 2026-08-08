from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from db.models.conversation import ConversationModel
from db.models.message import MessageModel

class ConversationRepository:

    @staticmethod
    def create_conversation(db: Session, title: str = "New Chat") -> ConversationModel:
        conv = ConversationModel(title=title)
        db.add(conv)
        db.commit()
        db.refresh(conv)
        return conv

    @staticmethod
    def get_conversation(db: Session, conversation_id: str) -> Optional[ConversationModel]:
        stmt = select(ConversationModel).where(ConversationModel.id == conversation_id)
        return db.scalars(stmt).first()

    @staticmethod
    def list_conversations(db: Session) -> List[ConversationModel]:
        stmt = select(ConversationModel).order_by(ConversationModel.updated_at.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def update_title(db: Session, conversation_id: str, new_title: str) -> Optional[ConversationModel]:
        conv = ConversationRepository.get_conversation(db, conversation_id)
        if not conv:
            return None
        conv.title = new_title.strip()
        conv.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(conv)
        return conv

    @staticmethod
    def delete_conversation(db: Session, conversation_id: str) -> bool:
        conv = ConversationRepository.get_conversation(db, conversation_id)
        if not conv:
            return False
        db.delete(conv)
        db.commit()
        return True

    @staticmethod
    def add_message(db: Session, conversation_id: str, role: str, content: str) -> MessageModel:
        conv = ConversationRepository.get_conversation(db, conversation_id)
        if not conv:
            conv = ConversationRepository.create_conversation(db, title=content[:28].strip() or "New Chat")
            conversation_id = conv.id

        msg = MessageModel(conversation_id=conversation_id, role=role, content=content)
        conv.updated_at = datetime.now(timezone.utc)
        db.add(msg)
        db.commit()
        db.refresh(msg)
        return msg

    @staticmethod
    def get_messages(db: Session, conversation_id: str) -> List[MessageModel]:
        stmt = select(MessageModel).where(MessageModel.conversation_id == conversation_id).order_by(MessageModel.created_at.asc())
        return list(db.scalars(stmt).all())
