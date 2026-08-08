import os
from typing import Dict, Any
from rag.config import KNOWLEDGE_BASE_DIR, RAG_TOP_K, RAG_SIMILARITY_THRESHOLD
from rag.loaders.document_loader import DocumentLoader
from rag.chunking.text_splitter import TextSplitter
from rag.embeddings.embedder import OllamaEmbedder
from rag.vector_store.vector_db import VectorStore
from rag.retriever.context_retriever import ContextRetriever

class RAGService:
    """Orchestrates document ingestion and retrieval for SentinelForge AI."""

    def __init__(self):
        self.loader = DocumentLoader(KNOWLEDGE_BASE_DIR)
        self.splitter = TextSplitter(chunk_size=500, chunk_overlap=50)
        self.embedder = OllamaEmbedder()
        self.vector_store = VectorStore()
        self.retriever = ContextRetriever(self.embedder, self.vector_store)
        self._is_ingested = False

    def ingest_initial_knowledge(self) -> int:
        """Ingests security documents from knowledge_base directory into VectorStore."""
        docs = self.loader.load_documents()
        if not docs:
            return 0

        all_chunks = []
        for doc in docs:
            chunks = self.splitter.split_document(doc)
            all_chunks.extend(chunks)

        if not all_chunks:
            return 0

        embeddings = [self.embedder.embed_text(c["text"]) for c in all_chunks]
        self.vector_store.add_chunks(all_chunks, embeddings)
        self._is_ingested = True
        return len(all_chunks)

    def retrieve_context(self, query: str) -> Dict[str, Any]:
        """Retrieves grounded security context for prompt builder."""
        if not self._is_ingested:
            self.ingest_initial_knowledge()
        return self.retriever.retrieve(query, top_k=RAG_TOP_K, threshold=RAG_SIMILARITY_THRESHOLD)

rag_service = RAGService()
