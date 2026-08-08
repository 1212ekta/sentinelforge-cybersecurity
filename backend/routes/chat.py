from fastapi import APIRouter

try:
    from models import ChatRequest, ChatResponse
    from services.ollama_service import get_ollama_response
except (ImportError, ModuleNotFoundError):
    from ..models import ChatRequest, ChatResponse
    from ..services.ollama_service import get_ollama_response

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    result = await get_ollama_response(request.prompt, request.conversation_id)
    return ChatResponse(**result)