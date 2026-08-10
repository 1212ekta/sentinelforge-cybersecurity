'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, RefreshCw, ShieldCheck, FileQuestion, FileBarChart } from 'lucide-react';
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
  severity?: string;
  type?: string;
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
    <div className="h-full w-full overflow-y-auto p-4 sm:p-8 bg-background text-foreground">
      <div className="max-w-5xl w-full mx-auto flex flex-col gap-6 pb-16">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0">
              <FileBarChart size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">Security Assessment Reports</h1>
              <p className="text-xs text-muted-foreground">View and download generated markdown executive security assessments.</p>
            </div>
          </div>

          <button
            onClick={fetchReports}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-xs font-medium text-foreground hover:bg-muted cursor-pointer shrink-0 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-2">
            <RefreshCw size={22} className="animate-spin text-primary" />
            <p className="text-xs font-normal">Loading security reports...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-md border border-danger/30 bg-danger/10 text-danger text-xs font-medium">
            {error}
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 rounded-md border border-border bg-card text-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
              <FileQuestion size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">No security reports yet.</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm font-normal leading-relaxed">
                Run a security analysis to generate your first report.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border bg-card shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Report</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2 max-w-xs">
                        <FileText size={15} className="text-primary shrink-0" />
                        <span className="truncate">{rep.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {rep.type || 'SAST Audit'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-severity-medium/10 text-severity-medium border border-severity-medium/20 text-[10px] font-bold uppercase">
                        {rep.severity || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {new Date(rep.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-semibold border border-emerald-500/20">
                        <ShieldCheck size={11} />
                        <span>Completed</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 justify-end">
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-background text-[11px] font-medium text-foreground hover:bg-muted cursor-pointer transition-colors"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDownloadMarkdown(rep.analysis_id, rep.title)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 cursor-pointer transition-colors"
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReportModal report={activeReportModal} onClose={() => setActiveReportModal(null)} />
    </div>
  );
}