'use client';

import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import type { ReportResponse } from '../types/security-analysis.types';

interface Props {
  report: ReportResponse | null;
  onClose: () => void;
}

export function ReportModal({ report, onClose }: Props) {
  if (!report) return null;

  const handleDownloadMarkdown = () => {
    const blob = new Blob([report.markdown_content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sentinelforge_report_${report.analysis_id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-fade-in">
      <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{report.title}</h2>
              <p className="text-xs text-muted-foreground">Generated At: {report.generated_at}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-muted/30 p-4 rounded-xl border border-border font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto">
          {report.markdown_content}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <button
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
          >
            <Download size={15} />
            <span>Download Markdown Report (.md)</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border bg-muted/50 text-xs font-medium text-foreground hover:bg-muted"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
