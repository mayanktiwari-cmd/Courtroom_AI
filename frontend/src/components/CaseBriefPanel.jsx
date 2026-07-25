import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const TIMELINE_EVENTS = [
  { date: 'OCT 12, 2024', event: 'FIR Registered', detail: 'FIR No. 342/2024 at Sec 20 Police Station under IPC 420/468.' },
  { date: 'NOV 04, 2024', event: 'Charge Sheet Filed', detail: 'Investigating Officer submitted 45-page preliminary charge sheet.' },
  { date: 'DEC 15, 2024', event: 'Interim Application', detail: 'Petitioner filed application for restraint on asset liquidation.' },
  { date: 'JAN 10, 2025', event: 'Written Statement', detail: 'Respondent filed formal reply denying allegations of dishonesty.' },
  { date: 'FEB 02, 2025', event: 'Pretrial Conference', detail: 'Pretrial argument session before Hon. Justice R. S. Pathak.' },
];

export default function CaseBriefPanel({ caseDetails }) {
  const [timelineOpen, setTimelineOpen] = useState(true);

  const title = caseDetails?.title || 'Startuop v. Meridian Holdings';
  const caseNo = caseDetails?.caseNo || 'Case No. 2024-CV-0841';
  const judge = caseDetails?.judge || 'Hon. Justice R. S. Pathak';
  const court = caseDetails?.court || 'High Court of Delhi';

  return (
    <div className="h-full bg-card text-text-main flex flex-col overflow-y-auto p-6 space-y-6">
      {/* Blue rule indicator */}
      <div className="section-blue-rule">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#007BFF]">
          Case Docket & Brief
        </span>
      </div>

      {/* Case Header */}
      <div>
        <h2 className="font-serif text-2xl font-semibold text-text-main leading-tight tracking-tighter">
          {title}
        </h2>
        <p className="text-xs font-mono text-text-muted mt-1 uppercase tracking-wider">
          {caseNo}
        </p>
      </div>

      {/* Case Status Typographic Badge */}
      <div className="border-l-2 border-[#007BFF] pl-3 py-1">
        <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Stage</p>
        <p className="text-xs font-medium text-text-main uppercase tracking-wider">Pretrial Arguments Scheduled</p>
      </div>

      <hr className="border-border" />

      {/* Forum & Bench */}
      <div className="space-y-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-text-muted tracking-wider block">Tribunal / Court</span>
          <span className="text-xs text-text-main font-medium">{court}</span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-text-muted tracking-wider block">Presiding Judge</span>
          <span className="text-xs text-text-main font-medium">{judge}</span>
        </div>
      </div>

      <hr className="border-border" />

      {/* Parties */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono uppercase text-[#0047AB] tracking-widest block font-semibold">Litigants</span>
        
        <div className="bg-surface border border-border p-3 space-y-1">
          <span className="text-[10px] font-mono text-text-muted uppercase block">Petitioner / Complainant</span>
          <p className="text-xs font-semibold text-text-main">Startuop Technologies Pvt. Ltd.</p>
          <p className="text-[11px] text-text-muted">Advocate: Emily R., Esq.</p>
        </div>

        <div className="bg-surface border border-border p-3 space-y-1">
          <span className="text-[10px] font-mono text-text-muted uppercase block">Respondent / Accused</span>
          <p className="text-xs font-semibold text-text-main">Meridian Holdings India Ltd.</p>
          <p className="text-[11px] text-text-muted">Advocate: K. V. Viswanathan, Adv.</p>
        </div>
      </div>

      <hr className="border-border" />

      {/* Statutory Provisions */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase text-[#0047AB] tracking-widest block font-semibold">Statutory Provisions</span>
        <div className="space-y-1 text-xs font-mono text-text-main">
          <div className="flex items-center justify-between bg-surface px-2.5 py-1.5 border border-border">
            <span className="font-semibold text-text-main">IPC Sec. 420</span>
            <span className="text-[10px] text-text-muted">Cheating</span>
          </div>
          <div className="flex items-center justify-between bg-surface px-2.5 py-1.5 border border-border">
            <span className="font-semibold text-text-main">IPC Sec. 468</span>
            <span className="text-[10px] text-text-muted">Forgery</span>
          </div>
          <div className="flex items-center justify-between bg-surface px-2.5 py-1.5 border border-border">
            <span className="font-semibold text-text-main">IPC Sec. 120B</span>
            <span className="text-[10px] text-text-muted">Conspiracy</span>
          </div>
        </div>
      </div>

      <hr className="border-border" />

      {/* Timeline of Filings */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setTimelineOpen(!timelineOpen)}
          className="w-full flex items-center justify-between text-[10px] font-mono uppercase text-[#0047AB] tracking-widest py-1 font-semibold hover:text-[#007BFF] transition-colors"
        >
          <span>Chronology of Filings ({TIMELINE_EVENTS.length})</span>
          {timelineOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {timelineOpen && (
          <div className="space-y-3 pt-2">
            {TIMELINE_EVENTS.map((ev, idx) => (
              <div key={idx} className="relative pl-4 border-l border-border">
                <div className="absolute -left-[4.5px] top-1 w-2 h-2 bg-[#007BFF]" />
                <span className="text-[10px] font-mono text-text-muted block">{ev.date}</span>
                <p className="text-xs font-semibold text-text-main mt-0.5">{ev.event}</p>
                <p className="text-[11px] text-text-muted mt-0.5 leading-normal">{ev.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
