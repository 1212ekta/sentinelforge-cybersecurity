import os
import re
import time
import uuid
import requests
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any
from dotenv import load_dotenv

try:
    from models import (
        AnalysisResponse,
        SecurityFinding,
        SeverityEnum,
        ConfidenceEnum,
    )
    from repositories.analysis_repository import MongoAnalysisRepository
    from services.finding_service import compute_statistics, compute_overall_risk
except (ImportError, ModuleNotFoundError):
    from ..models import (
        AnalysisResponse,
        SecurityFinding,
        SeverityEnum,
        ConfidenceEnum,
    )
    from ..repositories.analysis_repository import MongoAnalysisRepository
    from ..services.finding_service import compute_statistics, compute_overall_risk

load_dotenv()

logger = logging.getLogger("sentinelforge")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL = os.getenv("OLLAMA_MODEL", "phi3:mini")

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {".py", ".c", ".java", ".js", ".log"}

def validate_file_upload(filename: str, file_size: int) -> str:
    if not filename:
        raise ValueError("Invalid upload: Filename cannot be empty.")

    clean_filename = os.path.basename(filename)
    _, ext = os.path.splitext(clean_filename.lower())

    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file extension '{ext}'. Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}")

    if file_size > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size exceeds 5MB limit. Uploaded size: {round(file_size / (1024*1024), 2)}MB")

    return clean_filename

async def analyze_security_file(content_bytes: bytes, filename: str) -> AnalysisResponse:
    start_time = time.time()
    clean_name = validate_file_upload(filename, len(content_bytes))
    _, ext = os.path.splitext(clean_name.lower())
    iso_now = datetime.now(timezone.utc).isoformat()
    analysis_id = f"anls_{uuid.uuid4().hex[:8]}"

    try:
        text_content = content_bytes.decode("utf-8", errors="replace")
    except Exception as e:
        raise ValueError(f"Could not parse file content as valid text: {e}")

    file_type = "log" if ext == ".log" else "source_code"
    findings: List[SecurityFinding] = []

    # 1. Pattern-Assisted Static Checks
    if file_type == "source_code":
        lines = text_content.splitlines()
        for idx, line in enumerate(lines, 1):
            if re.search(r"SELECT\s+.*\s+FROM\s+.*\+|(cursor|db)\.execute\(f['\"]", line, re.IGNORECASE):
                findings.append(SecurityFinding(
                    id=f"fnd_{uuid.uuid4().hex[:8]}",
                    title="SQL Injection Risk",
                    severity=SeverityEnum.HIGH,
                    category="Injection / CWE-89",
                    description="User-controlled input is directly concatenated into a raw database SQL query.",
                    evidence=line.strip(),
                    impact="Attacker may manipulate the SQL query to read or modify unauthorized database contents.",
                    recommendation="Use parameterized queries or prepared statements (e.g. cursor.execute('SELECT * FROM users WHERE name = ?', (name,))).",
                    confidence=ConfidenceEnum.HIGH,
                    source_file=clean_name,
                    line_number=idx,
                    cwe_id="CWE-89",
                    created_at=iso_now
                ))
            if re.search(r"eval\(|exec\(|os\.system\(|subprocess\.call\(", line):
                findings.append(SecurityFinding(
                    id=f"fnd_{uuid.uuid4().hex[:8]}",
                    title="Command Injection Vulnerability",
                    severity=SeverityEnum.CRITICAL,
                    category="Command Injection / CWE-78",
                    description="Direct execution of dynamic commands via system shell interpreters.",
                    evidence=line.strip(),
                    impact="Attacker could execute arbitrary OS commands on the host server.",
                    recommendation="Avoid eval/exec. Use subprocess with explicit argument arrays (shell=False).",
                    confidence=ConfidenceEnum.HIGH,
                    source_file=clean_name,
                    line_number=idx,
                    cwe_id="CWE-78",
                    created_at=iso_now
                ))
            if re.search(r"(api_key|password|secret|private_key)\s*=\s*['\"][A-Za-z0-9_\-]{8,}['\"]", line, re.IGNORECASE):
                findings.append(SecurityFinding(
                    id=f"fnd_{uuid.uuid4().hex[:8]}",
                    title="Hardcoded Secret Credential",
                    severity=SeverityEnum.MEDIUM,
                    category="Cryptographic Failures / CWE-798",
                    description="Hardcoded API key or secret token detected in source code.",
                    evidence=line.strip()[:60] + "...",
                    impact="Credentials exposed in repository version control.",
                    recommendation="Store secrets in environment variables or key management services.",
                    confidence=ConfidenceEnum.MEDIUM,
                    source_file=clean_name,
                    line_number=idx,
                    cwe_id="CWE-798",
                    created_at=iso_now
                ))
    else:  # Log file
        failed_logins = len(re.findall(r"Failed password|authentication failure|invalid user", text_content, re.IGNORECASE))
        if failed_logins > 3:
            findings.append(SecurityFinding(
                id=f"fnd_{uuid.uuid4().hex[:8]}",
                title="SSH Brute-Force Activity Pattern",
                severity=SeverityEnum.HIGH if failed_logins > 10 else SeverityEnum.MEDIUM,
                category="Authentication Anomaly / CWE-307",
                description=f"Observed {failed_logins} failed authentication attempts in log stream.",
                evidence=f"Observed {failed_logins} failed password events in {clean_name}.",
                impact="Potential unauthorized credential compromise or service degradation.",
                recommendation="Enforce Fail2Ban rate-limiting and disable SSH password authentication.",
                confidence=ConfidenceEnum.HIGH,
                source_file=clean_name,
                cwe_id="CWE-307",
                created_at=iso_now
            ))

    # 2. Non-blocking LLM Summary
    summary_prompt = f"Summarize security audit results for {clean_name} ({file_type}) with {len(findings)} findings."
    summary = f"SentinelForge analyzed {clean_name} and identified {len(findings)} potential security findings."

    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    import httpx
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            if groq_key:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                    json={
                        "model": "llama-3.1-8b-instant",
                        "messages": [{"role": "user", "content": summary_prompt}],
                        "max_tokens": 100,
                    },
                )
                if res.status_code == 200:
                    summary = res.json()["choices"][0]["message"]["content"]
            else:
                res = await client.post(
                    f"{OLLAMA_URL}/api/generate",
                    json={"model": MODEL, "prompt": summary_prompt, "stream": False, "options": {"num_predict": 80}},
                )
                if res.status_code == 200:
                    summary = res.json().get("response", summary)
    except Exception as sum_err:
        logger.debug(f"Fast summary generation skipped: {sum_err}")


    stats = compute_statistics(findings)
    risk_level = compute_overall_risk(stats)
    processing_time = round(time.time() - start_time, 3)

    # 3. Save to MongoDB Repository
    try:
        await MongoAnalysisRepository.save_analysis(
            analysis_id=analysis_id,
            filename=clean_name,
            file_type=file_type,
            summary=summary,
            risk_level=risk_level.value,
            processing_time=processing_time,
            findings_data=[f.model_dump() for f in findings]
        )
    except Exception as db_err:
        logger.warning(f"MongoDB persistence warning during file analysis: {db_err}")

    return AnalysisResponse(
        success=True,
        analysis_id=analysis_id,
        summary=summary,
        risk_level=risk_level,
        findings=findings,
        statistics=stats,
        files_analyzed=[clean_name],
        processing_time=processing_time,
        created_at=iso_now
    )
