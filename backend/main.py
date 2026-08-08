import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

try:
    from routes.chat import router as chat_router
    from routes.analysis import router as analysis_router
    from routes.conversations import router as conversations_router
    from db.database import init_db
except (ImportError, ModuleNotFoundError):
    from .routes.chat import router as chat_router
    from .routes.analysis import router as analysis_router
    from .routes.conversations import router as conversations_router
    from .db.database import init_db

init_db()  # Initialize database tables on startup

app = FastAPI(title="SentinelForge API")

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