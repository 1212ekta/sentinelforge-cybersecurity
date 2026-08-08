from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from db.models.analysis import AnalysisModel
from db.models.finding import FindingModel

class AnalysisRepository:

    @staticmethod
    def save_analysis(
        db: Session,
        analysis_id: str,
        filename: str,
        file_type: str,
        summary: str,
        risk_level: str,
        processing_time: float,
        findings_data: List[dict],
        conversation_id: Optional[str] = None
    ) -> AnalysisModel:
        analysis = AnalysisModel(
            id=analysis_id,
            conversation_id=conversation_id,
            filename=filename,
            file_type=file_type,
            summary=summary,
            risk_level=risk_level,
            processing_time=processing_time,
        )
        db.add(analysis)

        for f in findings_data:
            finding = FindingModel(
                id=f.get("id"),
                analysis_id=analysis_id,
                title=f.get("title"),
                severity=f.get("severity"),
                category=f.get("category"),
                description=f.get("description"),
                evidence=f.get("evidence"),
                impact=f.get("impact"),
                recommendation=f.get("recommendation"),
                confidence=f.get("confidence", "HIGH"),
                source_file=f.get("source_file", filename),
                line_number=f.get("line_number"),
                cwe_id=f.get("cwe_id"),
                cve_id=f.get("cve_id"),
            )
            db.add(finding)

        db.commit()
        db.refresh(analysis)
        return analysis

    @staticmethod
    def get_analysis(db: Session, analysis_id: str) -> Optional[AnalysisModel]:
        stmt = (
            select(AnalysisModel)
            .options(joinedload(AnalysisModel.findings))
            .where(AnalysisModel.id == analysis_id)
        )
        return db.scalars(stmt).unique().first()

    @staticmethod
    def list_analyses(db: Session) -> List[AnalysisModel]:
        stmt = select(AnalysisModel).order_by(AnalysisModel.created_at.desc())
        return list(db.scalars(stmt).all())
