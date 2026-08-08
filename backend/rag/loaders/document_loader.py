import os
from typing import List, Dict, Any

class DocumentLoader:
    """Loads authoritative security documentation (.md, .txt, .json) from knowledge_base directory."""

    def __init__(self, knowledge_dir: str):
        self.knowledge_dir = knowledge_dir

    def load_documents(self) -> List[Dict[str, Any]]:
        documents = []
        if not os.path.exists(self.knowledge_dir):
            return documents

        for root, _, files in os.walk(self.knowledge_dir):
            for file in files:
                if file.endswith(('.md', '.txt', '.json')):
                    filepath = os.path.join(root, file)
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            content = f.read()

                        documents.append({
                            "id": file,
                            "filename": file,
                            "filepath": filepath,
                            "content": content,
                            "metadata": {
                                "source": file,
                                "category": "cybersecurity_reference"
                            }
                        })
                    except Exception as e:
                        print(f"Error loading document {filepath}: {e}")

        return documents
