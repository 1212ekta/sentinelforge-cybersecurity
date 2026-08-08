from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import PlainTextResponse

try:
    from models import AnalysisResponse, ReportResponse
    from services.analysis_service import analyze_security_file
    from services.finding_service import get_analysis_result, generate_markdown_report
    from repositories.report_repository import MongoReportRepository
except (ImportError, ModuleNotFoundError):
    from ..models import AnalysisResponse, ReportResponse
    from ..services.analysis_service import analyze_security_file
    from ..services.finding_service import get_analysis_result, generate_markdown_report
    from ..repositories.report_repository import MongoReportRepository

router = APIRouter()

@router.post("/analyze-file", response_model=AnalysisResponse)
async def analyze_file(file: UploadFile = File(...)):
    """
    Uploads and inspects a source code (.py, .c, .java, .js) or log (.log) file for security vulnerabilities.
    Never executes the uploaded file.
    """
    try:
        content_bytes = await file.read()
        result = await analyze_security_file(content_bytes, file.filename or "uploaded_file")
        return result
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as err:
        raise HTTPException(status_code=500, detail="Internal server error during file security analysis.")

@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(analysis_id: str):
    """Retrieves a previously stored security analysis result by ID."""
    result = await get_analysis_result(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Analysis ID '{analysis_id}' not found.")
    return result

@router.get("/reports")
async def list_reports():
    """Lists all executive security reports stored in MongoDB Atlas."""
    return await MongoReportRepository.list_reports()

@router.post("/analysis/{analysis_id}/report", response_model=ReportResponse)
async def create_analysis_report(analysis_id: str):
    """Generates an executive security report object for a given analysis ID."""
    result = await get_analysis_result(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Analysis ID '{analysis_id}' not found.")
    return await generate_markdown_report(result)

@router.get("/analysis/{analysis_id}/report/markdown", response_class=PlainTextResponse)
async def get_analysis_markdown_report(analysis_id: str):
    """Returns downloadable raw Markdown security report text."""
    result = await get_analysis_result(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Analysis ID '{analysis_id}' not found.")
    report = await generate_markdown_report(result)
    return report.markdown_content
