export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface SecurityFinding {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  description: string;
  evidence: string;
  impact: string;
  recommendation: string;
  confidence: Confidence;
  source_file: string;
  line_number?: number | null;
  cwe_id?: string | null;
  cve_id?: string | null;
  references?: string[] | null;
  created_at: string;
}

export interface FindingStatistics {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface AnalysisResponse {
  success: boolean;
  analysis_id: string;
  summary: string;
  risk_level: Severity;
  findings: SecurityFinding[];
  statistics: FindingStatistics;
  files_analyzed: string[];
  processing_time: number;
  created_at: string;
}

export interface ReportResponse {
  analysis_id: string;
  title: string;
  markdown_content: string;
  generated_at: string;
}
