from typing import Optional
from fastapi import APIRouter, Header

try:
    from models import ChatRequest, ChatResponse
    from services.ollama_service import get_ollama_response
except (ImportError, ModuleNotFoundError):
    from ..models import ChatRequest, ChatResponse
    from ..services.ollama_service import get_ollama_response

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    x_guest_id: Optional[str] = Header(None, alias="X-Guest-ID")
):
    guest_id = x_guest_id or "default_guest"
    result = await get_ollama_response(request.prompt, request.conversation_id, guest_id=guest_id)
    return ChatResponse(**result)