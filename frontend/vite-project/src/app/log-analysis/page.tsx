'use client';

import React, { useState, useRef, useMemo } from 'react';
import { ScrollText, Upload, FileText, CheckCircle2, RefreshCw, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { AnalysisResponse, SecurityFinding, ReportResponse } from '@/features/security-analysis/types/security-analysis.types';
import { RiskSummaryHeader } from '@/features/security-analysis/components/RiskSummaryHeader';
import { FindingFilters } from '@/features/security-analysis/components/FindingFilters';
import { FindingCard } from '@/features/security-analysis/components/FindingCard';
import { FindingDetailsModal } from '@/features/security-analysis/components/FindingDetailsModal';
import { ReportModal } from '@/features/security-analysis/components/ReportModal';
import { config } from '@/lib/config';

export default function LogAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<SecurityFinding | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);

  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

    if (ext !== '.log') {
      setError(`Invalid log file extension '${ext}'. Please upload a valid .log file.`);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Log file exceeds 5MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyzeLog = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${config.apiBaseUrl}/analyze-file`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: 'Log analysis failed' }));
        throw new Error(errData.detail || `Server returned error status ${res.status}`);
      }

      const data: AnalysisResponse = await res.json();
      setAnalysis(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during log analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!analysis) return;
    try {
      const res = await fetch(`${config.apiBaseUrl}/analysis/${analysis.analysis_id}/report`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Report generation failed');
      const repData: ReportResponse = await res.json();
      setReport(repData);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Could not generate report.');
    }
  };

  const filteredFindings = useMemo(() => {
    if (!analysis) return [];
    return analysis.findings.filter((f) => {
      const matchesSev = selectedSeverity === 'ALL' || f.severity.toUpperCase() === selectedSeverity;
      const matchesSearch =
        !searchQuery ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.evidence.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSev && matchesSearch;
    });
  }, [analysis, selectedSeverity, searchQuery]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-8 bg-background text-foreground">
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <ScrollText size={22} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">Security Log Stream Analysis</h1>
            <p className="text-xs text-muted-foreground">Inspect server logs, auth streams, and system audit logs for brute-force attacks and privilege escalation.</p>
          </div>
        </div>

        {/* Upload Log Area */}
        {!analysis && (
          <div className="flex flex-col gap-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 p-8 sm:p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                isDragOver
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card/60 hover:bg-muted/70 hover:border-primary/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".log"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Upload size={24} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {file ? file.name : 'Upload log file for security analysis.'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported: <span className="font-mono text-primary font-medium">.log</span> (Max 5MB)
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/80 pt-1">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                  <span>Log streams are parsed as text and are never executed.</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-medium">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {file && (
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-xs">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{round(file.size / 1024, 1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={handleAnalyzeLog}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Analyzing Log Stream...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={16} />
                      <span>Analyze Log Stream</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Structured Findings View */}
        {analysis && (
          <div className="flex flex-col gap-6">
            <RiskSummaryHeader analysis={analysis} onGenerateReport={handleGenerateReport} />

            <FindingFilters
              selectedSeverity={selectedSeverity}
              onSelectSeverity={setSelectedSeverity}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            <div className="flex flex-col gap-3">
              {filteredFindings.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-border bg-card text-center gap-2">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                  <p className="text-sm font-bold text-foreground">No Log Anomalies Detected</p>
                  <p className="text-xs text-muted-foreground">The log stream shows zero suspicious authentication failures or brute-force patterns.</p>
                </div>
              ) : (
                filteredFindings.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    onViewDetails={(f) => setSelectedFinding(f)}
                  />
                ))
              )}
            </div>

            <div className="flex justify-end border-t border-border pt-4">
              <button
                onClick={() => {
                  setAnalysis(null);
                  setFile(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-muted/50 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Analyze Another Log Stream</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <FindingDetailsModal finding={selectedFinding} onClose={() => setSelectedFinding(null)} />
      <ReportModal report={report} onClose={() => setReport(null)} />
    </div>
  );
}

function round(val: number, decimals: number) {
  return Number(Math.round(Number(val + 'e' + decimals)) + 'e-' + decimals);
}