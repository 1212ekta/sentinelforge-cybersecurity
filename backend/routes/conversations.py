from typing import List, Optional
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel

try:
    from repositories.conversation_repository import MongoConversationRepository
except (ImportError, ModuleNotFoundError):
    from ..repositories.conversation_repository import MongoConversationRepository

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
async def create_conversation(req: CreateConversationRequest = Body(...)):
    conv = await MongoConversationRepository.create_conversation(title=req.title or "New Chat")
    return ConversationSchema(
        id=conv["id"],
        title=conv["title"],
        created_at=conv["created_at"].isoformat() if hasattr(conv["created_at"], "isoformat") else str(conv["created_at"]),
        updated_at=conv["updated_at"].isoformat() if hasattr(conv["updated_at"], "isoformat") else str(conv["updated_at"])
    )

@router.get("", response_model=List[ConversationSchema])
async def list_conversations():
    convs = await MongoConversationRepository.list_conversations()
    return [
        ConversationSchema(
            id=c["id"],
            title=c["title"],
            created_at=str(c["created_at"]),
            updated_at=str(c["updated_at"])
        )
        for c in convs
    ]

@router.get("/{conversation_id}", response_model=ConversationSchema)
async def get_conversation(conversation_id: str):
    conv = await MongoConversationRepository.get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationSchema(
        id=conv["id"],
        title=conv["title"],
        created_at=conv["created_at"].isoformat() if hasattr(conv["created_at"], "isoformat") else str(conv["created_at"]),
        updated_at=conv["updated_at"].isoformat() if hasattr(conv["updated_at"], "isoformat") else str(conv["updated_at"])
    )

@router.patch("/{conversation_id}", response_model=ConversationSchema)
async def update_conversation(conversation_id: str, req: UpdateConversationRequest = Body(...)):
    conv = await MongoConversationRepository.update_title(conversation_id, req.title)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationSchema(
        id=conv["id"],
        title=conv["title"],
        created_at=str(conv["created_at"]),
        updated_at=str(conv["updated_at"])
    )

@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str):
    success = await MongoConversationRepository.delete_conversation(conversation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"success": True, "message": "Conversation deleted successfully"}

@router.get("/{conversation_id}/messages", response_model=List[MessageSchema])
async def get_conversation_messages(conversation_id: str):
    conv = await MongoConversationRepository.get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    msgs = await MongoConversationRepository.get_messages(conversation_id)
    return [
        MessageSchema(
            id=m["id"],
            conversation_id=m["conversation_id"],
            role=m["role"],
            content=m["content"],
            created_at=str(m["created_at"])
        )
        for m in msgs
    ]
