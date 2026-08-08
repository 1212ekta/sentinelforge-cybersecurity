from typing import List, Dict, Any, Optional
from prompts.security_system_prompt import get_security_system_prompt

def build_cybersecurity_prompt(
    user_prompt: str,
    history_messages: List[Dict[str, Any]],
    system_prompt: Optional[str] = None,
    retrieved_context: Optional[str] = None,
    max_turns: int = 6
) -> str:
    """
    Constructs a structured prompt pipeline combining:
    1. System Prompt (Defensive Cybersecurity Persona)
    2. Future Retrieved Security Context (RAG hook interface)
    3. Conversation Context (up to max_turns)
    4. Current User Message
    """
    sys_prompt = system_prompt or get_security_system_prompt()
    prompt = f"System Instructions:\n{sys_prompt}\n\n"

    # Hook for future RAG (Retrieval-Augmented Generation) document retrieval
    if retrieved_context and retrieved_context.strip():
        prompt += f"Retrieved Security Context (Authoritative Sources):\n{retrieved_context.strip()}\n\n"

    if history_messages:
        prompt += "Conversation Context:\n"
        recent_turns = history_messages[-max_turns:]
        for msg in recent_turns:
            role = "User" if msg.get("role") == "user" else "Assistant"
            content = msg.get("content", "")
            prompt += f"{role}: {content}\n\n"

    prompt += f"User Query:\n{user_prompt}\n\nAssistant:"
    return prompt
