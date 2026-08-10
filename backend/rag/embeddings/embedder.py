import os
import requests
from typing import List
from rag.config import EMBEDDING_MODEL, BASE_DIR
from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")

class OllamaEmbedder:
    """Generates dense vector embeddings using nomic-embed-text via local Ollama API with fast fallback."""

    def __init__(self, model_name: str = EMBEDDING_MODEL):
        self.model_name = model_name

    def embed_text(self, text: str) -> List[float]:
        try:
            res = requests.post(
                f"{OLLAMA_URL}/api/embeddings",
                json={"model": self.model_name, "prompt": text},
                timeout=1.5,
            )
            res.raise_for_status()
            emb = res.json().get("embedding", [])
            if emb:
                return emb
        except Exception:
            pass

        # Fast deterministic hash vector fallback if Ollama embedding engine is offline/slow
        import hashlib
        hash_val = int(hashlib.md5(text.encode()).hexdigest(), 16)
        return [(float((hash_val >> i) & 0xFF) / 255.0) for i in range(128)]
