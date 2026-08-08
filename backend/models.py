from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import Enum

class SeverityEnum(str, Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ConfidenceEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class SecurityFinding(BaseModel):
    id: str = Field(..., description="Unique finding ID")
    title: str = Field(..., description="Finding title")
    severity: SeverityEnum = Field(..., description="Assessed severity level")
    category: str = Field(..., description="Vulnerability category or OWASP/CWE classification")
    description: str = Field(..., description="Detailed description of the finding")
    evidence: str = Field(..., description="Observed evidence snippet or log line")
    impact: str = Field(..., description="Potential security impact")
    recommendation: str = Field(..., description="Recommended remediation guidance")
    confidence: ConfidenceEnum = Field(ConfidenceEnum.HIGH, description="Assessment confidence")
    source_file: str = Field(..., description="Source filename")
    line_number: Optional[int] = Field(None, description="Line number if applicable")
    cwe_id: Optional[str] = Field(None, description="CWE identifier e.g. CWE-89")
    cve_id: Optional[str] = Field(None, description="CVE identifier e.g. CVE-2023-1234")
    references: Optional[List[str]] = Field(default_factory=list, description="Reference links or standards")
    created_at: str = Field(..., description="ISO timestamp")

class FindingStatistics(BaseModel):
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    info: int = 0

class AnalysisResponse(BaseModel):
    success: bool = True
    analysis_id: str
    summary: str
    risk_level: SeverityEnum
    findings: List[SecurityFinding]
    statistics: FindingStatistics
    files_analyzed: List[str]
    processing_time: float
    created_at: str

class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="User query or security analysis prompt")
    conversation_id: Optional[str] = Field(None, description="Optional UUID for active conversation thread")

class ChatResponse(BaseModel):
    success: bool = True
    response: str
    conversation_id: str
    timestamp: str
    processing_time: float
    error: Optional[str] = None

class ReportResponse(BaseModel):
    analysis_id: str
    title: str
    markdown_content: str
    generated_at: str