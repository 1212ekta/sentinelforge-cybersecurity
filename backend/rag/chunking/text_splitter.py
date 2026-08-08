from typing import List, Dict, Any

class TextSplitter:
    """Sliding-window text chunker for security documents preserving metadata."""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_document(self, doc: Dict[str, Any]) -> List[Dict[str, Any]]:
        text = doc.get("content", "")
        chunks = []
        if not text:
            return chunks

        step = max(1, self.chunk_size - self.chunk_overlap)
        doc_id = doc.get("id", "doc")
        metadata = doc.get("metadata", {})

        for i in range(0, len(text), step):
            chunk_text = text[i : i + self.chunk_size].strip()
            if len(chunk_text) > 30:  # Ignore tiny whitespace chunks
                chunk_id = f"{doc_id}_chunk_{len(chunks)}"
                chunks.append({
                    "id": chunk_id,
                    "text": chunk_text,
                    "metadata": {
                        **metadata,
                        "chunk_index": len(chunks),
                        "source": doc.get("filename", doc_id),
                    }
                })

        return chunks
