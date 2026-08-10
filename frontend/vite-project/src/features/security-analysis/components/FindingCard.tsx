'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle, Shield, Info, ExternalLink, FileCode } from 'lucide-react';
import type { SecurityFinding } from '../types/security-analysis.types';

interface Props {
  finding: SecurityFinding;
  onViewDetails: (finding: SecurityFinding) => void;
}

export function FindingCard({ finding, onViewDetails }: Props) {
  const getSeverityBadge = (sev: string) => {
    switch (sev.toUpperCase()) {
      case 'CRITICAL':
        return {
          style: 'bg-red-500/10 text-red-500 border-red-500/30',
          icon: ShieldAlert,
        };
      case 'HIGH':
        return {
          style: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
          icon: AlertTriangle,
        };
      case 'MEDIUM':
        return {
          style: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
          icon: AlertTriangle,
        };
      case 'LOW':
        return {
          style: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
          icon: Shield,
        };
      default:
        return {
          style: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          icon: Info,
        };
    }
  };


  const badge = getSeverityBadge(finding.severity);
  const SeverityIcon = badge.icon;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-xs font-bold uppercase ${badge.style}`}>
            <SeverityIcon size={12} className="shrink-0" />
            <span>{finding.severity}</span>
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
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded px-1"
        >
          <span>Details</span>
          <ExternalLink size={12} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
        <FileCode size={13} className="text-primary shrink-0" />
        <span>{finding.source_file}{finding.line_number ? `:${finding.line_number}` : ''}</span>
        <span>•</span>
        <span>Category: <strong className="text-foreground font-sans">{finding.category}</strong></span>
        <span>•</span>
        <span>Confidence: <strong className="text-foreground font-sans">{finding.confidence}</strong></span>
      </div>

      {finding.evidence && (
        <div className="bg-muted/40 p-2.5 rounded-lg border border-border text-xs font-mono text-foreground overflow-x-auto">
          <span className="text-[10px] text-muted-foreground font-sans font-semibold uppercase tracking-wider block mb-1">
            Evidence
          </span>
          <code>{finding.evidence}</code>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-border/50">
        <div>
          <span className="font-bold text-foreground block mb-0.5">Impact:</span>
          <p className="text-muted-foreground line-clamp-2 leading-relaxed">{finding.impact}</p>
        </div>
        <div>
          <span className="font-bold text-foreground block mb-0.5">Recommendation:</span>
          <p className="text-muted-foreground line-clamp-2 leading-relaxed">{finding.recommendation}</p>
        </div>
      </div>
    </div>
  );
}

