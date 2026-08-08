from typing import List, Dict, Any
from rag.embeddings.embedder import OllamaEmbedder
from rag.vector_store.vector_db import VectorStore
from rag.config import RAG_TOP_K, RAG_SIMILARITY_THRESHOLD

class ContextRetriever:
    """Retrieves authoritative security context chunks and formats citations."""

    def __init__(self, embedder: OllamaEmbedder, vector_store: VectorStore):
        self.embedder = embedder
        self.vector_store = vector_store

    def retrieve(self, query: str, top_k: int = RAG_TOP_K, threshold: float = RAG_SIMILARITY_THRESHOLD) -> Dict[str, Any]:
        if not query or not query.strip():
            return {"context_text": "", "citations": []}

        query_emb = self.embedder.embed_text(query)
        if not query_emb:
            return {"context_text": "", "citations": []}

        matches = self.vector_store.search(query_emb, top_k=top_k)
        valid_matches = [m for m in matches if m.get("score", 0.0) >= threshold]

        if not valid_matches:
            return {"context_text": "", "citations": []}

        formatted_chunks = []
        citations = []

        for idx, match in enumerate(valid_matches, 1):
            source = match.get("metadata", {}).get("source", "Authoritative Doc")
            text = match.get("text", "").strip()
            formatted_chunks.append(f"[{idx}] Source ({source}):\n{text}")
            citations.append({
                "id": idx,
                "source": source,
                "score": match.get("score", 0.0)
            })

        context_text = "\n\n".join(formatted_chunks)
        return {
            "context_text": context_text,
            "citations": citations
        }
