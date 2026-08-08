import uuid
from datetime import datetime, timezone
from typing import Dict, Optional, List
from sqlalchemy.orm import Session
from models import AnalysisResponse, SecurityFinding, FindingStatistics, SeverityEnum, ConfidenceEnum, ReportResponse
from db.database import SessionLocal
from db.repositories.analysis_repository import AnalysisRepository
from db.repositories.report_repository import ReportRepository

def compute_statistics(findings: List[SecurityFinding]) -> FindingStatistics:
    stats = FindingStatistics()
    for f in findings:
        sev = f.severity if isinstance(f.severity, SeverityEnum) else SeverityEnum(f.severity)
        if sev == SeverityEnum.CRITICAL:
            stats.critical += 1
        elif sev == SeverityEnum.HIGH:
            stats.high += 1
        elif sev == SeverityEnum.MEDIUM:
            stats.medium += 1
        elif sev == SeverityEnum.LOW:
            stats.low += 1
        else:
            stats.info += 1
    return stats

def compute_overall_risk(stats: FindingStatistics) -> SeverityEnum:
    if stats.critical > 0:
        return SeverityEnum.CRITICAL
    if stats.high > 0:
        return SeverityEnum.HIGH
    if stats.medium > 0:
        return SeverityEnum.MEDIUM
    if stats.low > 0:
        return SeverityEnum.LOW
    return SeverityEnum.INFO

def get_analysis_result(analysis_id: str) -> Optional[AnalysisResponse]:
    db = SessionLocal()
    try:
        model = AnalysisRepository.get_analysis(db, analysis_id)
        if not model:
            return None

        findings = [
            SecurityFinding(
                id=f.id,
                title=f.title,
                severity=SeverityEnum(f.severity),
                category=f.category,
                description=f.description,
                evidence=f.evidence,
                impact=f.impact,
                recommendation=f.recommendation,
                confidence=ConfidenceEnum(f.confidence),
                source_file=f.source_file,
                line_number=f.line_number,
                cwe_id=f.cwe_id,
                cve_id=f.cve_id,
                created_at=f.created_at.isoformat() if hasattr(f.created_at, 'isoformat') else str(f.created_at)
            )
            for f in model.findings
        ]

        stats = compute_statistics(findings)

        return AnalysisResponse(
            success=True,
            analysis_id=model.id,
            summary=model.summary,
            risk_level=SeverityEnum(model.risk_level),
            findings=findings,
            statistics=stats,
            files_analyzed=[model.filename],
            processing_time=model.processing_time,
            created_at=model.created_at.isoformat() if hasattr(model.created_at, 'isoformat') else str(model.created_at)
        )
    finally:
        db.close()

def generate_markdown_report(analysis: AnalysisResponse) -> ReportResponse:
    db = SessionLocal()
    try:
        existing_rpt = ReportRepository.get_report_by_analysis(db, analysis.analysis_id)
        if existing_rpt:
            return ReportResponse(
                analysis_id=analysis.analysis_id,
                title=existing_rpt.title,
                markdown_content=existing_rpt.content,
                generated_at=existing_rpt.created_at.isoformat() if hasattr(existing_rpt.created_at, 'isoformat') else str(existing_rpt.created_at)
            )

        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        stats = analysis.statistics

        md = f"""# SENTINELFORGE
## Executive Security Assessment Report

**Report ID:** `{analysis.analysis_id}`  
**Generated At:** `{now_str}`  
**Overall Risk Level:** `{analysis.risk_level.value}`  

---

### 1. Executive Summary
{analysis.summary}

### 2. Assessment Scope
- **Files Analyzed:** {", ".join(analysis.files_analyzed) if analysis.files_analyzed else "None"}
- **Analysis Duration:** {analysis.processing_time} seconds

### 3. Finding Statistics
| Severity | Count |
| :--- | :--- |
| **Critical** | `{stats.critical}` |
| **High** | `{stats.high}` |
| **Medium** | `{stats.medium}` |
| **Low** | `{stats.low}` |
| **Info** | `{stats.info}` |

---

### 4. Detailed Security Findings

"""

        if not analysis.findings:
            md += "*No security vulnerabilities or anomalies were identified in the analyzed target.*\n"
        else:
            for idx, f in enumerate(analysis.findings, 1):
                md += f"""#### [{f.severity.value}] Finding {idx}: {f.title}
- **Category:** {f.category}
- **Confidence:** {f.confidence.value}
- **Source File:** `{f.source_file}`{" (Line " + str(f.line_number) + ")" if f.line_number else ""}
- **CWE / CVE:** {f.cwe_id or "N/A"} {f.cve_id or ""}

**Description:**  
{f.description}

**Observed Evidence:**  
```
{f.evidence}
```

**Security Impact:**  
{f.impact}

**Remediation Recommendation:**  
{f.recommendation}

---

"""

        md += """### 5. Conclusion & Recommendations
Perform immediate remediation for Critical and High severity findings. Integrate automated SAST/DAST checks into CI/CD pipelines to prevent reintroduction of reported flaws.
"""

        rpt_id = f"rpt_{uuid.uuid4().hex[:8]}"
        rpt_title = f"SentinelForge Security Report - {analysis.analysis_id}"
        ReportRepository.save_report(db, rpt_id, analysis.analysis_id, rpt_title, md, "markdown")

        return ReportResponse(
            analysis_id=analysis.analysis_id,
            title=rpt_title,
            markdown_content=md,
            generated_at=now_str
        )
    finally:
        db.close()
