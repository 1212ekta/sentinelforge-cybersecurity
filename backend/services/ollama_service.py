import os
import uuid
import time
import httpx
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

try:
    from database import init_mongo_db
    from repositories.conversation_repository import MongoConversationRepository
    from prompts.security_system_prompt import get_security_system_prompt
    from prompts.prompt_builder import build_cybersecurity_prompt
    from rag.rag_service import rag_service
except (ImportError, ModuleNotFoundError):
    from ..database import init_mongo_db
    from ..repositories.conversation_repository import MongoConversationRepository
    from ..prompts.security_system_prompt import get_security_system_prompt
    from ..prompts.prompt_builder import build_cybersecurity_prompt
    from ..rag.rag_service import rag_service

load_dotenv()

logger = logging.getLogger("sentinelforge")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434").strip()
MODEL = os.getenv("OLLAMA_MODEL", "phi3:mini").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()

async def get_ollama_response(
    prompt: str,
    conversation_id: Optional[str] = None,
    override_context: Optional[str] = None,
    guest_id: str = "default_guest"
) -> Dict[str, Any]:
    """
    Executes a structured cybersecurity analysis prompt using non-blocking async HTTP calls against
    Cloud Groq API (if GROQ_API_KEY is configured) or local Ollama LLM with MongoDB persistence.
    Includes explicit timing logs for RAG, LLM inference, and total response time.
    """
    overall_start_time = time.time()
    iso_timestamp = datetime.now(timezone.utc).isoformat()
    cid = conversation_id if conversation_id and conversation_id.strip() else str(uuid.uuid4())

    logger.info(f"[CHAT] Request received for guest_id='{guest_id}', conversation_id='{cid}'")

    if not prompt or not prompt.strip():
        processing_time = round(time.time() - overall_start_time, 3)
        logger.warning(f"[CHAT] Empty prompt received for conversation_id='{cid}'")
        return {
            "success": False,
            "response": "Security query prompt cannot be empty. Please provide a question, source code snippet, or log text.",
            "conversation_id": cid,
            "timestamp": iso_timestamp,
            "processing_time": processing_time,
            "error": "Empty prompt provided."
        }

    # 1. Save user prompt & fetch conversation history from MongoDB
    db_start_time = time.time()
    try:
        user_msg = await MongoConversationRepository.add_message(cid, "user", prompt, guest_id=guest_id)
        cid = user_msg["conversation_id"]
        db_messages = await MongoConversationRepository.get_messages(cid, guest_id=guest_id)
        history_messages = [{"role": m["role"], "content": m["content"]} for m in db_messages[:-1]]
        logger.info(f"[CHAT] MongoDB message history retrieved in {time.time() - db_start_time:.3f}s ({len(history_messages)} turns)")
    except Exception as db_err:
        logger.warning(f"[CHAT] MongoDB persistence unavailable ({db_err}). Proceeding in ephemeral mode.")
        history_messages = []

    # 2. Retrieve authoritative RAG security context
    rag_start_time = time.time()
    logger.info(f"[CHAT] RAG retrieval started for query: '{prompt[:40]}...'")
    rag_result = rag_service.retrieve_context(prompt) if not override_context else {"context_text": override_context, "citations": []}
    retrieved_context = rag_result.get("context_text", "")
    citations = rag_result.get("citations", [])
    rag_elapsed = time.time() - rag_start_time
    logger.info(f"[CHAT] RAG retrieval completed in {rag_elapsed:.3f}s (retrieved {len(citations)} citations)")

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
    llm_start_time = time.time()

    # 4. Non-blocking Async Request completion from Cloud Groq API or Local Ollama
    async with httpx.AsyncClient() as client:
        # 4a. Attempt Cloud Groq API if configured
        if GROQ_API_KEY:
            try:
                logger.info("[CHAT] LLM request started (provider=groq, model=llama-3.1-8b-instant)")
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": "llama-3.1-8b-instant",
                        "messages": [{"role": "user", "content": full_prompt}],
                        "max_tokens": 600,
                    },
                    timeout=30.0,
                )
                if res.status_code == 200:
                    data = res.json()
                    reply = data["choices"][0]["message"]["content"]
                    llm_elapsed = time.time() - llm_start_time
                    logger.info(f"[CHAT] LLM request completed in {llm_elapsed:.3f}s via Groq Cloud API")
                else:
                    logger.warning(f"[CHAT] Groq API returned status {res.status_code}: {res.text[:100]}. Falling back to Ollama.")
            except Exception as groq_err:
                logger.warning(f"[CHAT] Groq API request failed ({groq_err}). Falling back to Ollama.")

        # 4b. Attempt Local Ollama if Groq was not used or failed
        if not reply:
            try:
                logger.info(f"[CHAT] LLM request started (provider=ollama, model={MODEL}, url={OLLAMA_URL})")
                res = await client.post(
                    f"{OLLAMA_URL}/api/generate",
                    json={
                        "model": MODEL,
                        "prompt": full_prompt,
                        "stream": False,
                        "options": {"num_predict": 300},
                    },
                    timeout=httpx.Timeout(45.0, connect=3.0),
                )
                if res.status_code == 200:
                    payload = res.json()
                    reply = payload.get("response", "Unexpected response format returned from AI model engine.")
                    llm_elapsed = time.time() - llm_start_time
                    logger.info(f"[CHAT] LLM request completed in {llm_elapsed:.3f}s via local Ollama")
                else:
                    logger.error(f"[CHAT] Ollama returned status {res.status_code}: {res.text[:100]}")
            except httpx.TimeoutException:
                processing_time = round(time.time() - overall_start_time, 3)
                logger.error(f"[CHAT] LLM request timed out after {processing_time}s")
                return {
                    "success": False,
                    "response": "AI analysis is taking longer than expected. Please retry.",
                    "conversation_id": cid,
                    "timestamp": iso_timestamp,
                    "processing_time": processing_time,
                    "error": "Request timeout"
                }
            except Exception as ollama_err:
                logger.error(f"[CHAT] Ollama connection error: {ollama_err}")

    # 4c. Fallback if no LLM provider returned a valid response
    if not reply:
        processing_time = round(time.time() - overall_start_time, 3)
        logger.error(f"[CHAT] All LLM providers failed or were unreachable in {processing_time}s")
        return {
            "success": False,
            "response": "Security analysis service is temporarily unavailable. Please verify backend LLM provider configuration.",
            "conversation_id": cid,
            "timestamp": iso_timestamp,
            "processing_time": processing_time,
            "error": "LLM provider unavailable"
        }

    # 5. Save assistant response to MongoDB
    try:
        await MongoConversationRepository.add_message(cid, "assistant", reply, guest_id=guest_id)
    except Exception as db_err:
        logger.warning(f"[CHAT] Failed to save assistant response to MongoDB: {db_err}")

    total_elapsed = round(time.time() - overall_start_time, 3)
    logger.info(f"[CHAT] Total response time for conversation_id='{cid}': {total_elapsed}s")

    return {
        "success": True,
        "response": reply,
        "conversation_id": cid,
        "timestamp": iso_timestamp,
        "processing_time": total_elapsed,
        "citations": citations,
        "error": None
    }