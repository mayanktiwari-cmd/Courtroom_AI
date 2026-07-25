import React, { useState } from 'react';

export default function CitationCard({ citation }) {
  const [expanded, setExpanded] = useState(false);

  const isVerified = citation.verdict === 'VERIFIED';
  const confidencePercent = Math.round((citation.confidence || 0.85) * 100);

  return (
    <div className={`p-5 bg-surface transition-colors shadow-sm ${
      isVerified ? 'border-l-4 border-l-[#007BFF] border-y border-r border-border' : 'border border-border'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h4 className="font-serif text-base font-semibold text-text-main leading-tight">
            {citation.title || 'Landmark Precedent Citation'}
          </h4>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-mono text-text-muted">
            <span className="text-[#0047AB] font-bold">{citation.court || 'Supreme Court of India'}</span>
            <span>|</span>
            <span>{citation.date || 'Recent Judgment'}</span>
          </div>
        </div>

        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 border shadow-[0_1px_2px_rgba(0,0,0,0.05)] shrink-0 ${
          isVerified
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {citation.verdict || 'VERIFIED'} ({confidencePercent}%)
        </span>
      </div>

      <p className="text-sm font-sans italic text-text-main mt-4 leading-relaxed border-l-2 border-[#007BFF] pl-4 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        "{citation.passage_preview || citation.reason}"
      </p>

      {citation.reason && (
        <div className="mt-3 text-[11px] font-mono text-text-muted flex items-start gap-2 bg-white p-2 border border-border">
          <span className="text-[#007BFF] font-bold uppercase tracking-wider shrink-0">Verifier Note:</span>
          <span>{citation.reason}</span>
        </div>
      )}

      {citation.passage && (
        <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-mono text-[#007BFF] hover:text-[#0047AB] font-bold uppercase tracking-wider transition-colors hover:underline"
          >
            {expanded ? '[ - Hide full passage ]' : '[ + Read full passage ]'}
          </button>
        </div>
      )}

      {expanded && citation.passage && (
        <div className="mt-3 p-4 bg-white border border-border text-xs font-mono text-text-main leading-relaxed max-h-60 overflow-y-auto shadow-inner">
          {citation.passage}
        </div>
      )}
    </div>
  );
}
