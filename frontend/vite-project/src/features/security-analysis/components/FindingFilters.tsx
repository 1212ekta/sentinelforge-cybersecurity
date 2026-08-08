'use client';

import React from 'react';
import { Search } from 'lucide-react';
import type { Severity } from '../types/security-analysis.types';

interface Props {
  selectedSeverity: string;
  onSelectSeverity: (severity: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const SEVERITY_OPTIONS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

export function FindingFilters({
  selectedSeverity,
  onSelectSeverity,
  searchQuery,
  onSearchChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-xl border border-border bg-card">
      {/* Severity Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1">
        {SEVERITY_OPTIONS.map((sev) => {
          const isSelected = selectedSeverity === sev;
          return (
            <button
              key={sev}
              onClick={() => onSelectSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {sev}
            </button>
          );
        })}
      </div>

      {/* Text Filter Search */}
      <div className="relative flex items-center rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs">
        <Search size={14} className="text-muted-foreground mr-1.5 shrink-0" />
        <input
          type="text"
          placeholder="Filter findings..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-48 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </div>
  );
}
