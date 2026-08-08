# SentinelForge — AI-Powered Cybersecurity Assistant

[![Production Status](https://img.shields.io/badge/Status-Production--Ready-emerald.svg)](#) [![License](https://img.shields.io/badge/License-MIT-blue.svg)](#) [![Framework](https://img.shields.io/badge/Stack-Next.js%20%7C%20FastAPI%20%7C%20SQLAlchemy-violet.svg)](#)

SentinelForge is a specialized, production-ready AI Cybersecurity Assistant designed for defensive security engineering, application security (AppSec) code reviews, static vulnerability assessments, security log auditing, and executive assessment report generation.

---

## Overview

Unlike generic AI chatbots, **SentinelForge** is specifically tuned and grounded for defensive cybersecurity domain tasks. It combines local LLM reasoning (`phi3:mini` via Ollama) with a modular Retrieval-Augmented Generation (RAG) pipeline, structured static security pattern analysis, PostgreSQL persistence, and Markdown security report generation.

---

## Problem Statement

Modern software development teams and security analysts face significant challenges:
1. **Generic AI Hallucination**: Off-the-shelf chatbots frequently invent non-existent CVE IDs, inaccurate CVSS scores, and unverified vulnerability details.
2. **Unstructured Security Advice**: Developers need actionable, structured findings (Evidence, Impact, Remediation, CWE classifications) rather than long, unstructured walls of text.
3. **Log & Source Code Exposure**: High-risk static security analysis requires safe, in-memory processing without executing untrusted code or exposing internal server paths.

SentinelForge solves these challenges by providing a strict defensive security engine with RAG grounding, in-memory file auditing, structured finding models, and persistent report generation.

---

## Key Features

- **AI Cybersecurity Persona & Prompt Pipeline**: Versioned system prompt enforcing defensive security identity, OWASP Top 10 standards, and anti-hallucination bounds.
- **Authoritative RAG Knowledge Engine**: Modular RAG pipeline indexing OWASP Top 10, NIST Cybersecurity Framework, and CVE/CVSS reference documents with ChromaDB vector search and source citations.
- **Untrusted Security File Analysis**: Dedicated analysis engine for `.py`, `.c`, `.java`, `.js`, and `.log` files, performing pattern-assisted static checks and LLM evaluation without code execution.
- **Structured Security Findings**: Validated finding schema featuring Severity levels (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`), CWE IDs, Confidence metrics, Line Numbers, Evidence code blocks, and Remediation advice.
- **Executive Security Assessment Reports**: Instant generation of structured executive security assessment reports with one-click Markdown file (`.md`) export.
- **Full Backend Database Persistence**: Robust PostgreSQL / SQLAlchemy 2.0 ORM persistence with Alembic migrations for conversations, messages, security findings, and assessment reports.
- **Production-Grade Responsive UI**: Next.js App Router frontend with dark mode aesthetics, interactive conversation drawer, Quick Action prompt cards, finding severity filters, details modal, and live progress indicators.

---

## Architecture Diagram

```
+-----------------------------------------------------------------------+
|                         Next.js App Router (UI)                       |
|           Chat Window | File Analysis | Findings | Reports           |
+-----------------------------------+-----------------------------------+
                                    | REST API Calls
                                    v
+-----------------------------------------------------------------------+
|                            FastAPI Backend                            |
|  +--------------------+  +----------------------+  +---------------+  |
|  | Conversation Router|  | File Analysis Router |  | Chat Router   |  |
|  +---------+----------+  +----------+-----------+  +-------+-------+  |
+------------|------------------------|----------------------|----------+
             |                        |                      |
             v                        v                      v
+-----------------------+  +--------------------+  +--------------------+
|  SQLAlchemy 2.0 ORM   |  | Static Pattern &   |  | Prompt Builder     |
| (PostgreSQL / SQLite) |  | In-Memory Parser   |  | Pipeline           |
+-----------------------+  +--------------------+  +---------+----------+
                                                             |
                                                             v
                                                   +--------------------+
                                                   | Grounded RAG Engine|
                                                   | (ChromaDB / NVD)   |
                                                   +---------+----------+
                                                             |
                                                             v
                                                   +--------------------+
                                                   | Ollama LLM Engine  |
                                                   | (phi3:mini / Cloud)|
                                                   +--------------------+
```

---

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React Icons.
- **Backend API**: FastAPI, Python 3.12, Pydantic v2, Uvicorn.
- **Database & ORM**: PostgreSQL / SQLite, SQLAlchemy 2.0, Alembic database migrations.
- **AI & LLM**: Ollama (`phi3:mini`), Groq API / Cloud fallback abstraction.
- **RAG & Vector Search**: ChromaDB vector store, `nomic-embed-text` embeddings, sliding-window chunking.

---

## AI & Cybersecurity Architecture

### Defensive Persona Boundaries
SentinelForge operates strictly under defensive security guidelines:
- Provides secure code remediation, vulnerability explanations, log analysis, and defensive architecture guidance.
- Refuses to generate zero-day exploits or malicious payloads intended for unauthorized attacks.
- Never fabricates unverified CVE numbers, CVSS scores, or vulnerability details.

---

## RAG Pipeline Architecture

```
Documents (OWASP / NIST / NVD)
        ↓
Document Loader (.md / .txt / .json)
        ↓
Text Splitter (Sliding Window Chunker)
        ↓
Ollama Embedder (nomic-embed-text)
        ↓
Vector Store (Persistent ChromaDB)
        ↓
Context Retriever (Similarity Threshold: 0.35)
        ↓
Prompt Builder (Injects retrieved_context + Citations)
        ↓
LLM Execution (Ollama phi3:mini)
```

---

## File Analysis Security

- **Supported File Types**: `.py`, `.c`, `.java`, `.js`, `.log`.
- **Upload Size Limit**: Strictly enforced 5MB max.
- **Zero Execution**: Files are read into memory buffers as string text; uploaded code is **NEVER** executed.
- **Filename Sanitization**: `os.path.basename` strips directory traversal paths (`../`).
- **Memory Processing**: In-memory analysis discards untrusted file contents immediately after processing.

---

## Security Findings Data Model

Each security finding is represented by a structured contract:
```typescript
interface SecurityFinding {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: string;
  description: string;
  evidence: string;
  impact: string;
  recommendation: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  source_file: string;
  line_number?: number;
  cwe_id?: string;
  cve_id?: string;
  created_at: string;
}
```

---

## Assessment Reports

Assessment reports combine executive summaries, scope, finding statistics, detailed findings, and recommendations into standard Markdown format (`.md`), downloadable with a single click.

---

## Environment Variables

### Backend Environment Variables (`backend/.env`):
```env
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000

OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=phi3:mini
GROQ_API_KEY=your_optional_groq_api_key

DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/sentinelforge_db
# Or local fallback:
# DATABASE_URL=sqlite:///./sentinelforge.db

EMBEDDING_MODEL=nomic-embed-text
VECTOR_DB_DIR=rag_storage/chroma
COLLECTION_NAME=cybersecurity_knowledge
RAG_TOP_K=3
RAG_SIMILARITY_THRESHOLD=0.35
```

### Frontend Environment Variables (`frontend/vite-project/.env`):
```env
VITE_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## Local Setup & Development

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Ollama (`ollama pull phi3:mini`)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

### 3. Frontend Setup
```bash
cd frontend/vite-project
npm install
npm run dev
```

---

## Database Setup & Migrations

Alembic handles database migrations cleanly:
```bash
cd backend
# Upgrade to latest migration schema
venv\Scripts\alembic upgrade head
```

---

## Testing

### Run Frontend Build Verification
```bash
cd frontend/vite-project
npm run build
```

### Run Backend Compilation Verification
```bash
cd backend
python -m compileall .
```

---

## Security Considerations

- **No Secrets Committed**: Repository uses strict `.gitignore` rules.
- **Environment-Driven CORS**: Origins strictly defined via `ALLOWED_ORIGINS`.
- **Database Safety**: All database interactions use SQLAlchemy 2.0 ORM parameterized queries.
- **Traceback Masking**: Raw server stack traces are suppressed in HTTP responses.

---

## Production Deployment

- **Frontend**: Deploy on Vercel setting `NEXT_PUBLIC_API_BASE_URL`.
- **Backend API**: Deploy on Render / Railway setting `DATABASE_URL` and `ALLOWED_ORIGINS`.
- **Database**: Managed PostgreSQL on Neon / Supabase.
