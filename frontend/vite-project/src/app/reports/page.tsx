'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, RefreshCw, Calendar, ShieldCheck, FileQuestion, FileBarChart } from 'lucide-react';
import { ReportModal } from '@/features/security-analysis/components/ReportModal';
import { config } from '@/lib/config';
import type { ReportResponse } from '@/features/security-analysis/types/security-analysis.types';

interface StoredReport {
  id: string;
  analysis_id: string;
  title: string;
  format: string;
  content: string;
  created_at: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeReportModal, setActiveReportModal] = useState<ReportResponse | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${config.apiBaseUrl}/reports`);
      if (!res.ok) throw new Error(`Server returned error status ${res.status}`);
      const data: StoredReport[] = await res.json();
      setReports(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not fetch security reports from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownloadMarkdown = async (analysisId: string, title: string) => {
    try {
      const res = await fetch(`${config.apiBaseUrl}/analysis/${analysisId}/report/markdown`);
      if (!res.ok) throw new Error('Download failed');
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to download report.');
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-8 bg-background text-foreground">
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <FileBarChart size={22} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">Security Assessment Reports</h1>
              <p className="text-xs text-muted-foreground">View and download generated markdown executive security assessments stored in database storage.</p>
            </div>
          </div>

          <button
            onClick={fetchReports}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted cursor-pointer shrink-0"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-2">
            <RefreshCw size={24} className="animate-spin text-primary" />
            <p className="text-xs">Loading security reports...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-medium">
            {error}
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-border bg-card text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
              <FileQuestion size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">No security reports yet.</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Run a security analysis to generate your first report.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate">{rep.title}</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-medium border border-emerald-500/20">
                        <ShieldCheck size={10} />
                        <span>Verified</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <Calendar size={12} className="shrink-0" />
                      <span>{new Date(rep.created_at).toLocaleString()}</span>
                      <span>•</span>
                      <span className="font-mono">{rep.format.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      setActiveReportModal({
                        success: true,
                        report_id: rep.id,
                        analysis_id: rep.analysis_id,
                        title: rep.title,
                        markdown_content: rep.content,
                        created_at: rep.created_at,
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDownloadMarkdown(rep.analysis_id, rep.title)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportModal report={activeReportModal} onClose={() => setActiveReportModal(null)} />
    </div>
  );
}