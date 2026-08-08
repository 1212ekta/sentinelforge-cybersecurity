'use client';

import React from 'react';
import { ShieldAlert, ExternalLink, FileCode, CheckCircle2 } from 'lucide-react';
import type { SecurityFinding } from '../types/security-analysis.types';

interface Props {
  finding: SecurityFinding;
  onViewDetails: (finding: SecurityFinding) => void;
}

export function FindingCard({ finding, onViewDetails }: Props) {
  const getSeverityBadge = (sev: string) => {
    switch (sev.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'LOW':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-md border text-xs font-bold uppercase ${getSeverityBadge(finding.severity)}`}>
            {finding.severity}
          </span>
          <h3 className="text-sm font-bold text-foreground">{finding.title}</h3>
          {finding.cwe_id && (
            <span className="px-2 py-0.5 rounded bg-muted text-[11px] font-mono text-muted-foreground">
              {finding.cwe_id}
            </span>
          )}
        </div>
        <button
          onClick={() => onViewDetails(finding)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
        >
          <span>View Details</span>
          <ExternalLink size={13} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <FileCode size={13} className="text-primary shrink-0" />
        <span>{finding.source_file}{finding.line_number ? `:${finding.line_number}` : ''}</span>
        <span>•</span>
        <span>Confidence: <strong className="text-foreground">{finding.confidence}</strong></span>
      </div>

      <div className="bg-muted/40 p-2.5 rounded-xl border border-border text-xs font-mono text-foreground overflow-x-auto">
        <span className="text-[10px] text-muted-foreground font-sans font-semibold uppercase tracking-wider block mb-1">
          Observed Evidence
        </span>
        <code>{finding.evidence}</code>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-border/50">
        <div>
          <span className="font-bold text-foreground block mb-0.5">Potential Impact:</span>
          <p className="text-muted-foreground line-clamp-2">{finding.impact}</p>
        </div>
        <div>
          <span className="font-bold text-foreground block mb-0.5">Remediation Advice:</span>
          <p className="text-muted-foreground line-clamp-2">{finding.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
