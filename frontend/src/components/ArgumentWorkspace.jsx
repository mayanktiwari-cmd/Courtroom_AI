import React, { useState, useRef } from 'react';

const DUMMY_CITATIONS = {
  1: {
    title: 'Satender Kumar Antil v. Central Bureau of Investigation',
    court: 'Supreme Court of India',
    date: '2022 SCC OnLine SC 825',
    excerpt: 'Section 41 and 41A of CrPC mandate that arrest should not be a routine exercise in offences punishable with imprisonment up to 7 years. Strict adherence to Arnesh Kumar guidelines is imperative.',
    verdict: 'VERIFIED (96% Match)'
  },
  2: {
    title: 'Suresh Kumar Bhikamchand Jain v. State of Maharashtra',
    court: 'Supreme Court of India',
    date: '(2013) 5 SCC 415',
    excerpt: 'Grant of bail during investigation phase where accused has cooperated with investigating agency and documents are in custody of police.',
    verdict: 'VERIFIED (92% Match)'
  },
  3: {
    title: 'State of Haryana v. Bhajan Lal',
    court: 'Supreme Court of India',
    date: '1992 Supp (1) SCC 335',
    excerpt: 'Category 1 & 7 principles for quashing FIR under Section 482 CrPC where allegations in FIR do not disclose cognizable offence or are manifestly attended with mala fide.',
    verdict: 'VERIFIED (98% Match)'
  }
};

export default function ArgumentWorkspace({ onAnalyze, isLoading, analysisData }) {
  const [inputText, setInputText] = useState('');
  const [hoveredCitation, setHoveredCitation] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const workspaceRef = useRef(null);

  const handleCitationHover = (e, citId) => {
    const rect = e.target.getBoundingClientRect();
    setTooltipPos({
      top: rect.top - 140,
      left: Math.min(rect.left, window.innerWidth - 340)
    });
    setHoveredCitation(citId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onAnalyze({ firText: inputText, perspective: 'defense' });
  };

  const defaultProse = [
    {
      num: 1,
      text: "Grounds for Interim Protection & Quashing: The allegations levelled in FIR No. 342/2024 prima facie fail to establish the essential ingredients of dishonest inducement under Section 420 IPC, as the transaction between the Petitioner and Respondent constitutes a bona fide commercial dispute.",
      citationId: 1
    },
    {
      num: 2,
      text: "Absence of Criminal Intent at Inception: As settled by the Hon'ble Supreme Court, mere failure to fulfill a contractual promise does not attract criminal liability unless fraudulent intention is demonstrated at the time of inception of the agreement.",
      citationId: 2
    },
    {
      num: 3,
      text: "Invocation of Inherent Jurisdiction under CrPC Section 482: Continued criminal proceedings against the Petitioner amount to an abuse of the process of law intended solely to exert improper pressure for civil recovery.",
      citationId: 3
    }
  ];

  return (
    <div ref={workspaceRef} className="h-full bg-surface flex flex-col flex-1 relative overflow-hidden">
      
      {/* Top Status Bar */}
      <div className="h-14 bg-card border-b border-border px-6 flex items-center justify-between shrink-0 font-mono text-xs text-text-muted shadow-sm z-10">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-text-main font-semibold uppercase tracking-wider">Session: Active</span>
          </span>
          <span className="hidden sm:inline border-l border-border pl-6 text-[#0047AB] font-semibold uppercase tracking-wider">
            Case No. 2024-CV-0841
          </span>
        </div>

        <button
          type="button"
          onClick={() => alert('Generating formal Legal Brief...')}
          className="text-[#007BFF] hover:text-[#0047AB] transition-colors small-caps font-semibold uppercase tracking-widest text-xs py-1"
        >
          Generate Brief
        </button>
      </div>

      {/* Main Workspace Area (Prose Document View) */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-surface">
        
        {/* Document Title Header */}
        <div className="border-b border-border pb-6 bg-card p-8 shadow-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#007BFF] mb-2 font-semibold">
            In the High Court of Delhi — Submissions for Petitioner
          </p>
          <h1 className="font-serif text-3xl font-normal text-text-main tracking-tight">
            Submissions on Behalf of Petitioner
          </h1>
          <p className="text-xs font-mono text-text-muted mt-1">
            Filed: {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} | Ref: ST-2024-DEF
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="py-8 px-6 bg-card border-l-4 border-[#007BFF] shadow-sm text-xs font-mono italic text-[#0047AB]">
            Analyzing precedents… cross-referencing 50,000+ Indian Kanoon judgments and running LLM-as-judge citation verification.
          </div>
        )}

        {/* AI Formatted Legal Response */}
        <div className="space-y-6">
          {analysisData ? (
            <div className="bg-card p-8 shadow-sm border-l-4 border-[#007BFF] space-y-6">
              {analysisData.strategy?.primary_arguments ? (
                analysisData.strategy.primary_arguments.map((arg, idx) => (
                  <p key={idx} className="font-sans text-sm text-text-main leading-relaxed text-justify">
                    <span className="font-mono font-semibold text-[#0047AB] mr-2">[{idx + 1}]</span>
                    {arg.argument || arg}
                    {arg.supporting_citation && (
                      <sup
                        onMouseEnter={(e) => handleCitationHover(e, (idx % 3) + 1)}
                        onMouseLeave={() => setHoveredCitation(null)}
                        className="ml-1 px-1.5 py-0.5 bg-blue-50 border border-[#007BFF]/30 text-[#007BFF] font-mono text-[10px] font-bold cursor-pointer hover:bg-[#007BFF] hover:text-white transition-colors"
                      >
                        [{idx + 1}]
                      </sup>
                    )}
                  </p>
                ))
              ) : (
                <div className="font-sans text-sm text-text-main leading-relaxed whitespace-pre-wrap">
                  {analysisData.raw_response}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card p-8 shadow-sm border-l-4 border-[#007BFF] space-y-6">
              {defaultProse.map((para) => (
                <p key={para.num} className="font-sans text-sm text-text-main leading-relaxed text-justify">
                  <span className="font-mono text-[#0047AB] font-bold mr-2">{para.num}.</span>
                  {para.text}
                  <sup
                    onMouseEnter={(e) => handleCitationHover(e, para.citationId)}
                    onMouseLeave={() => setHoveredCitation(null)}
                    className="ml-1 px-1.5 py-0.5 bg-blue-50 border border-[#007BFF]/30 text-[#007BFF] font-mono text-[10px] font-bold cursor-pointer hover:bg-[#007BFF] hover:text-white transition-colors"
                  >
                    [{para.citationId}]
                  </sup>
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hover Citation Popover */}
      {hoveredCitation && DUMMY_CITATIONS[hoveredCitation] && (
        <div
          style={{ top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` }}
          className="fixed z-50 w-80 bg-white border border-border shadow-lg p-4 pointer-events-none"
        >
          <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
            <span className="text-[10px] font-mono uppercase text-[#007BFF] font-semibold">Precedent [{hoveredCitation}]</span>
            <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
              {DUMMY_CITATIONS[hoveredCitation].verdict}
            </span>
          </div>
          <h4 className="font-serif text-xs font-semibold text-text-main mb-1">
            {DUMMY_CITATIONS[hoveredCitation].title}
          </h4>
          <p className="text-[10px] font-mono text-text-muted mb-2">
            {DUMMY_CITATIONS[hoveredCitation].court} | {DUMMY_CITATIONS[hoveredCitation].date}
          </p>
          <p className="text-xs text-text-main italic font-sans border-l-2 border-[#007BFF] pl-2 leading-normal">
            "{DUMMY_CITATIONS[hoveredCitation].excerpt}"
          </p>
        </div>
      )}

      {/* User Input Area — Legal Notepad Style */}
      <div className="bg-white border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.02)] p-4 sm:p-5 shrink-0 text-text-main z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted font-bold">
            Legal Notepad & Argument Input
          </span>
          <span className="text-[10px] font-mono text-text-muted">
            Paste FIR, facts, or counter-pleas
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type argument points or paste FIR text for precedent analysis..."
            className="w-full bg-surface text-text-main placeholder-text-muted/60 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#007BFF]/50 resize-none leading-relaxed border border-border p-3"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] font-mono text-text-muted">
              Press Submit to run BM25 + Dense RAG over 50k Kanoon Judgments
            </span>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-6 py-2.5 bg-[#007BFF] hover:bg-[#005CE6] text-white disabled:opacity-40 disabled:hover:bg-[#007BFF] text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              {isLoading ? 'Analyzing…' : 'Submit Argument'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
