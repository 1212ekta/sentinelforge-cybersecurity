import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

try:
    from routes.chat import router as chat_router
    from routes.analysis import router as analysis_router
    from routes.conversations import router as conversations_router
    from database import init_mongo_db
except (ImportError, ModuleNotFoundError):
    from .routes.chat import router as chat_router
    from .routes.analysis import router as analysis_router
    from .routes.conversations import router as conversations_router
    from .database import init_mongo_db

app = FastAPI(title="SentinelForge API")

@app.on_event("startup")
async def on_startup():
    await init_mongo_db()

raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000")
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(analysis_router)
app.include_router(conversations_router)

@app.get("/")
def home():
    return {"message": "Welcome to SentinelForge API"}

@app.get("/health")
def health_check():
    """Quick, non-blocking health endpoint required by load balancers and diagnostic monitors."""
    return {"status": "ok", "service": "SentinelForge API"}

@app.get("/health/ai")
async def ai_health_check():
    """Diagnostic endpoint to verify AI engine readiness (Groq cloud or Ollama local) without exposing secrets."""
    import httpx
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434").strip()

    if groq_key:
        return {
            "status": "ok",
            "provider": "groq",
            "model": os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
            "groq_configured": True
        }

    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            res = await client.get(f"{ollama_url}/api/tags")
            if res.status_code == 200:
                return {
                    "status": "ok",
                    "provider": "ollama",
                    "model": os.getenv("OLLAMA_MODEL", "phi3:mini"),
                    "ollama_url": ollama_url
                }
    except Exception as e:
        return {
            "status": "degraded",
            "provider": "none",
            "error": f"Ollama engine unreachable at {ollama_url}. Groq API key not configured.",
            "detail": str(e)
        }

    return {
        "status": "degraded",
        "provider": "none",
        "error": "No active LLM provider configured."
    }