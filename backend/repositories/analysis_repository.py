from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from database import analyses_collection, findings_collection

in_memory_analyses: Dict[str, Dict[str, Any]] = {}
in_memory_findings: List[Dict[str, Any]] = []

class MongoAnalysisRepository:

    @staticmethod
    async def save_analysis(
        analysis_id: str,
        filename: str,
        file_type: str,
        summary: str,
        risk_level: str,
        processing_time: float,
        findings_data: List[dict],
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        analysis_doc = {
            "id": analysis_id,
            "conversation_id": conversation_id,
            "filename": filename,
            "file_type": file_type,
            "summary": summary,
            "risk_level": risk_level,
            "processing_time": processing_time,
            "created_at": now,
        }

        finding_docs = []
        for f in findings_data:
            finding_docs.append({
                "id": f.get("id"),
                "analysis_id": analysis_id,
                "title": f.get("title"),
                "severity": f.get("severity"),
                "category": f.get("category"),
                "description": f.get("description"),
                "evidence": f.get("evidence"),
                "impact": f.get("impact"),
                "recommendation": f.get("recommendation"),
                "confidence": f.get("confidence", "HIGH"),
                "source_file": f.get("source_file", filename),
                "line_number": f.get("line_number"),
                "cwe_id": f.get("cwe_id"),
                "cve_id": f.get("cve_id"),
                "created_at": now,
            })

        try:
            await analyses_collection.insert_one(analysis_doc)
            if finding_docs:
                await findings_collection.insert_many(finding_docs)
        except Exception:
            in_memory_analyses[analysis_id] = analysis_doc
            in_memory_findings.extend(finding_docs)

        analysis_doc["created_at"] = now.isoformat()
        return analysis_doc

    @staticmethod
    async def get_analysis(analysis_id: str) -> Optional[Dict[str, Any]]:
        analysis = None
        findings = []
        try:
            analysis = await analyses_collection.find_one({"id": analysis_id}, {"_id": 0})
            if analysis:
                cursor = findings_collection.find({"analysis_id": analysis_id}, {"_id": 0})
                findings = await cursor.to_list(length=100)
        except Exception:
            pass

        if not analysis:
            analysis = in_memory_analyses.get(analysis_id)
            if analysis:
                findings = [f for f in in_memory_findings if f.get("analysis_id") == analysis_id]

        if not analysis:
            return None

        for f in findings:
            if isinstance(f.get("created_at"), datetime):
                f["created_at"] = f["created_at"].isoformat()

        if isinstance(analysis.get("created_at"), datetime):
            analysis["created_at"] = analysis["created_at"].isoformat()

        analysis["findings"] = findings
        return analysis

    @staticmethod
    async def list_analyses() -> List[Dict[str, Any]]:
        analyses = []
        try:
            cursor = analyses_collection.find({}, {"_id": 0}).sort("created_at", -1)
            analyses = await cursor.to_list(length=100)
        except Exception:
            analyses = list(in_memory_analyses.values())

        for a in analyses:
            if isinstance(a.get("created_at"), datetime):
                a["created_at"] = a["created_at"].isoformat()
        return analyses
