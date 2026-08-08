from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel

try:
    from db.database import get_db
    from db.repositories.conversation_repository import ConversationRepository
except (ImportError, ModuleNotFoundError):
    from ..db.database import get_db
    from ..db.repositories.conversation_repository import ConversationRepository

router = APIRouter(prefix="/conversations", tags=["conversations"])

class CreateConversationRequest(BaseModel):
    title: Optional[str] = "New Chat"

class UpdateConversationRequest(BaseModel):
    title: str

class MessageSchema(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: str

class ConversationSchema(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str

@router.post("", response_model=ConversationSchema)
def create_conversation(req: CreateConversationRequest = Body(...), db: Session = Depends(get_db)):
    conv = ConversationRepository.create_conversation(db, title=req.title or "New Chat")
    return ConversationSchema(
        id=conv.id,
        title=conv.title,
        created_at=conv.created_at.isoformat(),
        updated_at=conv.updated_at.isoformat()
    )

@router.get("", response_model=List[ConversationSchema])
def list_conversations(db: Session = Depends(get_db)):
    convs = ConversationRepository.list_conversations(db)
    return [
        ConversationSchema(
            id=c.id,
            title=c.title,
            created_at=c.created_at.isoformat(),
            updated_at=c.updated_at.isoformat()
        )
        for c in convs
    ]

@router.get("/{conversation_id}", response_model=ConversationSchema)
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conv = ConversationRepository.get_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationSchema(
        id=conv.id,
        title=conv.title,
        created_at=conv.created_at.isoformat(),
        updated_at=conv.updated_at.isoformat()
    )

@router.patch("/{conversation_id}", response_model=ConversationSchema)
def update_conversation(conversation_id: str, req: UpdateConversationRequest = Body(...), db: Session = Depends(get_db)):
    conv = ConversationRepository.update_title(db, conversation_id, req.title)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationSchema(
        id=conv.id,
        title=conv.title,
        created_at=conv.created_at.isoformat(),
        updated_at=conv.updated_at.isoformat()
    )

@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    success = ConversationRepository.delete_conversation(db, conversation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"success": True, "message": "Conversation deleted successfully"}

@router.get("/{conversation_id}/messages", response_model=List[MessageSchema])
def get_conversation_messages(conversation_id: str, db: Session = Depends(get_db)):
    conv = ConversationRepository.get_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    msgs = ConversationRepository.get_messages(db, conversation_id)
    return [
        MessageSchema(
            id=m.id,
            conversation_id=m.conversation_id,
            role=m.role,
            content=m.content,
            created_at=m.created_at.isoformat()
        )
        for m in msgs
    ]
