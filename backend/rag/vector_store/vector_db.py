import os
from typing import List, Dict, Any
from rag.config import VECTOR_DB_DIR, COLLECTION_NAME, RAG_TOP_K

try:
    import chromadb
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False

class VectorStore:
    """ChromaDB persistent vector store for cybersecurity document chunks."""

    def __init__(self, collection_name: str = COLLECTION_NAME, persist_dir: str = VECTOR_DB_DIR):
        self.collection_name = collection_name
        self.persist_dir = persist_dir
        self.documents: List[Dict[str, Any]] = []

        if CHROMADB_AVAILABLE:
            os.makedirs(persist_dir, exist_ok=True)
            self.client = chromadb.PersistentClient(path=persist_dir)
            self.collection = self.client.get_or_create_collection(name=collection_name)
        else:
            self.client = None
            self.collection = None

    def add_chunks(self, chunks: List[Dict[str, Any]], embeddings: List[List[float]]) -> None:
        if not chunks:
            return

        if CHROMADB_AVAILABLE and self.collection is not None:
            ids = [c["id"] for c in chunks]
            documents = [c["text"] for c in chunks]
            metadatas = [c["metadata"] for c in chunks]

            self.collection.upsert(
                ids=ids,
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas
            )
        else:
            for c, emb in zip(chunks, embeddings):
                self.documents.append({**c, "embedding": emb})

    def search(self, query_embedding: List[float], top_k: int = RAG_TOP_K) -> List[Dict[str, Any]]:
        if CHROMADB_AVAILABLE and self.collection is not None:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )

            retrieved = []
            if results and results.get("documents") and results["documents"][0]:
                for doc, meta, dist in zip(results["documents"][0], results["metadatas"][0], results["distances"][0] if "distances" in results else [0]*len(results["documents"][0])):
                    retrieved.append({
                        "text": doc,
                        "metadata": meta,
                        "score": max(0.0, 1.0 - float(dist)) if dist else 0.8
                    })
            return retrieved
        else:
            # Simple cosine similarity fallback
            import math
            def cosine(v1, v2):
                dot = sum(a*b for a,b in zip(v1,v2))
                m1 = math.sqrt(sum(a*a for a in v1))
                m2 = math.sqrt(sum(b*b for b in v2))
                return dot / (m1 * m2) if m1 and m2 else 0.0

            scored = []
            for item in self.documents:
                sim = cosine(query_embedding, item["embedding"])
                scored.append({"text": item["text"], "metadata": item["metadata"], "score": sim})

            scored.sort(key=lambda x: x["score"], reverse=True)
            return scored[:top_k]
