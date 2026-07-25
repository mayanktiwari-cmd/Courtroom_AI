import React from 'react';
import CitationCard from './CitationCard';

export default function StrategyCard({ strategy, rawResponse, verifiedCitations, ipcSections }) {
  if (!strategy || Object.keys(strategy).length === 0) {
    return (
      <div className="bg-card shadow-sm border border-border p-6 text-text-main font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {rawResponse || 'No legal strategy compiled yet.'}
      </div>
    );
  }

  const {
    executive_summary,
    key_legal_issues = [],
    primary_arguments = [],
    counter_arguments_to_anticipate = [],
    recommended_next_steps = [],
    overall_case_strength = 'Medium',
    risk_factors = [],
  } = strategy;

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-card shadow-sm border border-border p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="section-blue-rule mb-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#007BFF] font-semibold">
                Case Strategy Brief
              </span>
            </div>
            <h2 className="font-serif text-2xl font-normal text-text-main">Executive Summary</h2>
          </div>
          <div className="border-l-4 border-[#007BFF] pl-3 py-1 text-xs font-mono uppercase tracking-wider text-text-main shrink-0 bg-surface pr-3 font-bold">
            <span className="text-[10px] text-text-muted block font-normal mb-0.5">Assessment</span>
            {overall_case_strength} Strength
          </div>
        </div>

        <p className="text-sm font-sans text-text-main leading-relaxed">
          {executive_summary || 'Analysis complete based on FIR facts and Indian Kanoon precedent database.'}
        </p>

        {key_legal_issues.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#0047AB] font-bold mb-3">
              Key Legal Issues Identified
            </p>
            <div className="flex flex-wrap gap-2">
              {key_legal_issues.map((issue, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-surface border border-border text-xs font-mono text-text-main font-semibold"
                >
                  {issue}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* IPC Statutory Provisions */}
      {ipcSections && ipcSections.length > 0 && (
        <div className="bg-card shadow-sm border border-border p-6 sm:p-8 space-y-4">
          <div className="section-blue-rule mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#007BFF] font-semibold">
              Statutory Code Mapping
            </span>
          </div>
          <h3 className="font-serif text-xl font-normal text-text-main">Applicable Penal Sections</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ipcSections.map((sec, idx) => (
              <div key={idx} className="bg-surface border border-border p-5 space-y-2">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-sm font-mono font-bold text-[#0047AB]">{sec.section}</span>
                  <span className="text-[10px] font-mono text-text-muted font-bold uppercase tracking-wider">{sec.applies_to}</span>
                </div>
                <h4 className="text-sm font-semibold text-text-main pt-1">{sec.title}</h4>
                <p className="text-xs text-text-muted leading-relaxed font-sans">{sec.explanation}</p>
                {sec.max_punishment && (
                  <p className="text-[10px] font-mono text-[#007BFF] font-bold pt-2 border-t border-border mt-2">
                    Max Punishment: {sec.max_punishment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Legal Arguments */}
      {primary_arguments.length > 0 && (
        <div className="bg-card shadow-sm border border-border p-6 sm:p-8 space-y-4">
          <div className="section-blue-rule mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#007BFF] font-semibold">
              Argued Pleadings
            </span>
          </div>
          <h3 className="font-serif text-xl font-normal text-text-main">Primary Legal Arguments</h3>

          <div className="space-y-4 pt-2">
            {primary_arguments.map((arg, idx) => (
              <div key={idx} className="bg-surface border-l-4 border-[#007BFF] p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#0047AB]">Paragraph {idx + 1}</span>
                  {arg.strength && (
                    <span className="text-[10px] font-mono font-bold uppercase text-text-muted border border-border bg-white px-2 py-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                      {arg.strength} Strength
                    </span>
                  )}
                </div>
                <p className="text-sm font-sans text-text-main leading-relaxed text-justify">
                  {arg.argument || arg}
                </p>
                {arg.supporting_citation && (
                  <p className="text-[11px] font-mono text-[#007BFF] font-bold pt-2 border-t border-border">
                    Precedent: {arg.supporting_citation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Precedents */}
      {verifiedCitations && verifiedCitations.length > 0 && (
        <div className="bg-card shadow-sm border border-border p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-4">
            <div>
              <div className="section-blue-rule mb-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#007BFF] font-semibold">
                  Citation Verification Pipeline
                </span>
              </div>
              <h3 className="font-serif text-xl font-normal text-text-main">
                Verified Indian Kanoon Judgments ({verifiedCitations.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#0047AB] bg-blue-50 border border-[#007BFF]/30 px-3 py-1.5 uppercase tracking-wider font-bold shrink-0">
              70B LLM-as-Judge Validated
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {verifiedCitations.map((cit, idx) => (
              <CitationCard key={idx} citation={cit} />
            ))}
          </div>
        </div>
      )}

      {/* Counter Arguments & Next Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {counter_arguments_to_anticipate.length > 0 && (
          <div className="bg-card shadow-sm border border-border p-6 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0047AB] font-bold block">
              Anticipated Opposition Pleadings
            </span>
            <ul className="space-y-3">
              {counter_arguments_to_anticipate.map((item, idx) => (
                <li key={idx} className="text-sm font-sans text-text-main bg-surface p-4 border border-border shadow-sm flex items-start gap-2">
                  <span className="text-[#007BFF] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommended_next_steps.length > 0 && (
          <div className="bg-card shadow-sm border border-border p-6 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0047AB] font-bold block">
              Advocate Action Items
            </span>
            <ul className="space-y-3">
              {recommended_next_steps.map((step, idx) => (
                <li key={idx} className="text-sm font-sans text-text-main bg-surface p-4 border border-border shadow-sm flex items-start gap-2">
                  <span className="text-[#007BFF] font-bold mt-0.5">→</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Risk Factors */}
      {risk_factors.length > 0 && (
        <div className="bg-card shadow-sm border border-red-200 p-6 space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-red-600 font-bold block">
            Critical Risk Vulnerabilities
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {risk_factors.map((risk, idx) => (
              <div key={idx} className="p-4 bg-red-50 border border-red-100 text-sm font-sans text-red-800 shadow-sm flex items-start gap-2">
                <span className="font-bold text-red-600">!</span>
                <span>{risk}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
