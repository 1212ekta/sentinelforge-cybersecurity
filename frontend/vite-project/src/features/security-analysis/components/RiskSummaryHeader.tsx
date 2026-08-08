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
        return 'bg-red-500/15 text-red-500 border-red-500/40';
      case 'HIGH':
        return 'bg-orange-500/15 text-orange-500 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-500 border-amber-500/40';
      case 'LOW':
        return 'bg-blue-500/15 text-blue-500 border-blue-500/40';
      default:
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40';
    }
  };

  const { statistics: s } = analysis;

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs shrink-0"
        >
          <FileText size={15} />
          <span>Generate Assessment Report</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/5">
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Critical</span>
          <span className="text-base font-extrabold text-red-500">{s.critical}</span>
        </div>
        <div className="p-2.5 rounded-xl border border-orange-500/20 bg-orange-500/5">
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">High</span>
          <span className="text-base font-extrabold text-orange-500">{s.high}</span>
        </div>
        <div className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Medium</span>
          <span className="text-base font-extrabold text-amber-500">{s.medium}</span>
        </div>
        <div className="p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5">
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Low</span>
          <span className="text-base font-extrabold text-blue-500">{s.low}</span>
        </div>
        <div className="p-2.5 rounded-xl border border-border bg-muted/30">
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Info</span>
          <span className="text-base font-extrabold text-foreground">{s.info}</span>
        </div>
      </div>
    </div>
  );
}
