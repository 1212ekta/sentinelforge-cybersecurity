from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from database import reports_collection

class MongoReportRepository:

    @staticmethod
    async def save_report(report_id: str, analysis_id: str, title: str, content: str, format_str: str = "markdown") -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        doc = {
            "id": report_id,
            "analysis_id": analysis_id,
            "title": title,
            "format": format_str,
            "content": content,
            "created_at": now,
        }
        await reports_collection.insert_one(doc)
        doc["created_at"] = now.isoformat()
        return doc

    @staticmethod
    async def get_report_by_analysis(analysis_id: str) -> Optional[Dict[str, Any]]:
        report = await reports_collection.find_one({"analysis_id": analysis_id}, {"_id": 0})
        if report and isinstance(report.get("created_at"), datetime):
            report["created_at"] = report["created_at"].isoformat()
        return report

    @staticmethod
    async def get_report_by_id(report_id: str) -> Optional[Dict[str, Any]]:
        report = await reports_collection.find_one({"id": report_id}, {"_id": 0})
        if report and isinstance(report.get("created_at"), datetime):
            report["created_at"] = report["created_at"].isoformat()
        return report

    @staticmethod
    async def list_reports() -> List[Dict[str, Any]]:
        cursor = reports_collection.find({}, {"_id": 0}).sort("created_at", -1)
        reports = await cursor.to_list(length=100)
        for r in reports:
            if isinstance(r.get("created_at"), datetime):
                r["created_at"] = r["created_at"].isoformat()
        return reports
