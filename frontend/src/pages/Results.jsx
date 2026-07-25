import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StrategyCard from '../components/StrategyCard';

export default function Results({ analysisData }) {
  if (!analysisData) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center px-6">
        <div className="bg-card shadow-sm border border-border p-8 space-y-4">
          <div className="section-blue-rule mx-auto w-fit">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#007BFF] font-semibold">
              Docket Empty
            </span>
          </div>
          <h2 className="font-serif text-2xl text-text-main">No Active Case Strategy Compiled</h2>
          <p className="text-sm font-sans text-text-muted max-w-md mx-auto">
            Submit a case FIR or legal document in the Evidence Vault to generate an advocate strategy and verified Kanoon citations.
          </p>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#007BFF] text-white hover:bg-[#005CE6] font-mono text-xs font-bold uppercase tracking-widest transition-colors shadow-sm mt-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go to Evidence Vault
          </Link>
        </div>
      </div>
    );
  }

  const {
    strategy,
    raw_response,
    verified_citations,
    ipc_sections,
    processing_time,
    num_steps,
  } = analysisData;

  return (
    <div className="max-w-4xl mx-auto py-12 sm:py-16 px-6 sm:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border bg-card p-6 shadow-sm">
        <div>
          <div className="section-blue-rule mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#007BFF] font-semibold">
              Compiled Legal Strategy
            </span>
          </div>
          <h1 className="font-serif text-3xl font-semibold text-text-main tracking-tighter">
            Startuop v. Meridian Holdings — Case Strategy
          </h1>
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider mt-1 font-semibold">
            Case No. 2024-CV-0841 | High Court of Delhi
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-[#0047AB] uppercase tracking-wider shrink-0 font-bold bg-blue-50 px-3 py-1.5 border border-[#007BFF]/30">
          <span>Execution: {processing_time}s</span>
          <span className="text-[#007BFF]">|</span>
          <span>{num_steps} Agent Steps</span>
        </div>
      </div>

      <div className="flex justify-start">
        <Link
          to="/analyze"
          className="text-xs font-mono uppercase tracking-wider font-semibold text-[#007BFF] hover:text-[#0047AB] transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Submit New Case FIR
        </Link>
      </div>

      <StrategyCard
        strategy={strategy}
        rawResponse={raw_response}
        verifiedCitations={verified_citations}
        ipcSections={ipc_sections}
      />
    </div>
  );
}
