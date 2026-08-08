import os
import uuid
import time
import requests
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

try:
    from db.database import SessionLocal, init_db
    from db.repositories.conversation_repository import ConversationRepository
    from prompts.security_system_prompt import get_security_system_prompt
    from prompts.prompt_builder import build_cybersecurity_prompt
    from rag.rag_service import rag_service
except (ImportError, ModuleNotFoundError):
    from ..db.database import SessionLocal, init_db
    from ..db.repositories.conversation_repository import ConversationRepository
    from ..prompts.security_system_prompt import get_security_system_prompt
    from ..prompts.prompt_builder import build_cybersecurity_prompt
    from ..rag.rag_service import rag_service

load_dotenv()
init_db()  # Ensure database tables are initialized

logger = logging.getLogger("sentinelforge")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL = os.getenv("OLLAMA_MODEL", "phi3:mini")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()

async def get_ollama_response(
    prompt: str,
    conversation_id: Optional[str] = None,
    override_context: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes a structured cybersecurity analysis prompt against local Ollama LLM
    or cloud API fallback (if GROQ_API_KEY is configured), persisting conversation entities.
    """
    start_time = time.time()
    iso_timestamp = datetime.now(timezone.utc).isoformat()
    cid = conversation_id if conversation_id and conversation_id.strip() else str(uuid.uuid4())

    if not prompt or not prompt.strip():
        processing_time = round(time.time() - start_time, 3)
        return {
            "success": False,
            "response": "Security query prompt cannot be empty. Please provide a question, source code snippet, or log text.",
            "conversation_id": cid,
            "timestamp": iso_timestamp,
            "processing_time": processing_time,
            "error": "Empty prompt provided."
        }

    db = SessionLocal()
    try:
        # 1. Save user prompt & fetch conversation history from Database
        user_msg = ConversationRepository.add_message(db, cid, "user", prompt)
        cid = user_msg.conversation_id
        db_messages = ConversationRepository.get_messages(db, cid)
        history_messages = [{"role": m.role, "content": m.content} for m in db_messages[:-1]]

        # 2. Retrieve authoritative RAG security context
        rag_result = rag_service.retrieve_context(prompt) if not override_context else {"context_text": override_context, "citations": []}
        retrieved_context = rag_result.get("context_text", "")

        # 3. Build complete cybersecurity prompt pipeline
        system_prompt = get_security_system_prompt()
        full_prompt = build_cybersecurity_prompt(
            user_prompt=prompt,
            history_messages=history_messages,
            system_prompt=system_prompt,
            retrieved_context=retrieved_context,
            max_turns=6
        )

        reply = ""

        # 4. Request completion from Cloud Groq API (if configured) or Local Ollama
        if GROQ_API_KEY:
            try:
                res = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": "llama-3.1-8b-instant",
                        "messages": [{"role": "user", "content": full_prompt}],
                        "max_tokens": 300,
                    },
                    timeout=30,
                )
                res.raise_for_status()
                reply = res.json()["choices"][0]["message"]["content"]
            except Exception as groq_err:
                logger.warning(f"Groq API call failed: {groq_err}. Falling back to Ollama.")

        if not reply:
            response = requests.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": MODEL,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {"num_predict": 150},
                },
                timeout=300,
            )
            response.raise_for_status()
            payload = response.json()
            reply = payload.get("response", "Unexpected response format returned from AI model engine.")

        # 5. Save assistant response to Database
        ConversationRepository.add_message(db, cid, "assistant", reply)

        processing_time = round(time.time() - start_time, 3)
        return {
            "success": True,
            "response": reply,
            "conversation_id": cid,
            "timestamp": iso_timestamp,
            "processing_time": processing_time,
            "citations": rag_result.get("citations", []),
            "error": None
        }

    except requests.Timeout:
        processing_time = round(time.time() - start_time, 3)
        err_msg = "LLM Generation Timeout: Inference took longer than expected."
        logger.error("LLM request timed out.")
        return {
            "success": False,
            "response": err_msg,
            "conversation_id": cid,
            "timestamp": iso_timestamp,
            "processing_time": processing_time,
            "error": "Request timeout"
        }
    except requests.RequestException as e:
        processing_time = round(time.time() - start_time, 3)
        err_msg = f"LLM Connection Error: Unable to connect to inference engine ({OLLAMA_URL}). Ensure model engine is running."
        logger.error(f"LLM connection error: {e}")
        return {
            "success": False,
            "response": err_msg,
            "conversation_id": cid,
            "timestamp": iso_timestamp,
            "processing_time": processing_time,
            "error": str(e)
        }
    finally:
        db.close()