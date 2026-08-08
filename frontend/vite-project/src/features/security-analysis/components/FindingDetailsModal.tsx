'use client';

import React from 'react';
import { X, ShieldAlert, FileCode, CheckCircle2, AlertOctagon } from 'lucide-react';
import type { SecurityFinding } from '../types/security-analysis.types';

interface Props {
  finding: SecurityFinding | null;
  onClose: () => void;
}

export function FindingDetailsModal({ finding, onClose }: Props) {
  if (!finding) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-fade-in">
      <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldAlert size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md border text-xs font-bold uppercase bg-primary/10 text-primary border-primary/30">
                  {finding.severity}
                </span>
                <h2 className="text-lg font-bold text-foreground">{finding.title}</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Category: {finding.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-muted/40 border border-border font-mono">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold font-sans block">Source File</span>
              <span className="text-foreground font-semibold">{finding.source_file}{finding.line_number ? `:${finding.line_number}` : ''}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold font-sans block">Confidence</span>
              <span className="text-foreground font-semibold">{finding.confidence}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold font-sans block">CWE / CVE</span>
              <span className="text-foreground font-semibold">{finding.cwe_id || 'N/A'}</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-1">Description</h4>
            <p className="text-muted-foreground leading-relaxed">{finding.description}</p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-1">Observed Evidence</h4>
            <div className="bg-muted/60 p-3 rounded-xl border border-border font-mono text-foreground overflow-x-auto">
              <code>{finding.evidence}</code>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-1">Security Impact</h4>
            <p className="text-muted-foreground leading-relaxed">{finding.impact}</p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-1">Remediation Guidance</h4>
            <p className="text-muted-foreground leading-relaxed">{finding.recommendation}</p>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
