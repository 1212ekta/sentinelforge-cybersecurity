'use client';

import React from 'react';
import { ShieldAlert, FileText, Download } from 'lucide-react';
import type { AnalysisResponse } from '../types/security-analysis.types';

interface Props {
  analysis: AnalysisResponse;
  onGenerateReport: () => void;
}

export function RiskSummaryHeader({ analysis, onGenerateReport }: Props) {
  const getRiskBadgeColor = (risk: string) => {
    switch (risk.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-severity-critical/15 text-severity-critical border-severity-critical/40';
      case 'HIGH':
        return 'bg-severity-high/15 text-severity-high border-severity-high/40';
      case 'MEDIUM':
        return 'bg-severity-medium/15 text-severity-medium border-severity-medium/40';
      case 'LOW':
        return 'bg-severity-low/15 text-severity-low border-severity-low/40';
      default:
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40';
    }
  };

  const { statistics: s } = analysis;

  return (
    <div className="flex flex-col gap-4 p-5 rounded-md border border-border bg-card shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Security Assessment</h2>
              <span className={`px-2.5 py-0.5 rounded-full border text-xs font-extrabold uppercase ${getRiskBadgeColor(analysis.risk_level)}`}>
                Overall Risk: {analysis.risk_level}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Analysis ID: <span className="font-mono">{analysis.analysis_id}</span> | Target: {analysis.files_analyzed.join(', ')}
            </p>
          </div>
        </div>

        <button
          onClick={onGenerateReport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <FileText size={15} />
          <span>Generate Assessment Report</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-md border border-severity-critical/20 bg-severity-critical/5">
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Critical</span>
          <span className="text-base font-extrabold text-severity-critical">{s.critical}</span>
        </div>
        <div className="p-2.5 rounded-md border border-severity-high/20 bg-severity-high/5">
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">High</span>
          <span className="text-base font-extrabold text-severity-high">{s.high}</span>
        </div>
        <div className="p-2.5 rounded-md border border-severity-medium/20 bg-severity-medium/5">
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Medium</span>
          <span className="text-base font-extrabold text-severity-medium">{s.medium}</span>
        </div>
        <div className="p-2.5 rounded-md border border-severity-low/20 bg-severity-low/5">
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Low</span>
          <span className="text-base font-extrabold text-severity-low">{s.low}</span>
        </div>
        <div className="p-2.5 rounded-md border border-severity-info/20 bg-severity-info/5">
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Info</span>
          <span className="text-base font-extrabold text-severity-info">{s.info}</span>
        </div>
      </div>
    </div>
  );

}
