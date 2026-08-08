from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from db.models.report import ReportModel

class ReportRepository:

    @staticmethod
    def save_report(db: Session, report_id: str, analysis_id: str, title: str, content: str, format_str: str = "markdown") -> ReportModel:
        report = ReportModel(
            id=report_id,
            analysis_id=analysis_id,
            title=title,
            content=content,
            format=format_str
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    @staticmethod
    def get_report_by_analysis(db: Session, analysis_id: str) -> Optional[ReportModel]:
        stmt = select(ReportModel).where(ReportModel.analysis_id == analysis_id).order_by(ReportModel.created_at.desc())
        return db.scalars(stmt).first()

    @staticmethod
    def get_report_by_id(db: Session, report_id: str) -> Optional[ReportModel]:
        stmt = select(ReportModel).where(ReportModel.id == report_id)
        return db.scalars(stmt).first()

    @staticmethod
    def list_reports(db: Session) -> List[ReportModel]:
        stmt = select(ReportModel).order_by(ReportModel.created_at.desc())
        return list(db.scalars(stmt).all())
