import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

function strengthDot(strength) {
  const s = (strength || '').toLowerCase();
  if (s === 'strong') return '#16a34a';
  if (s === 'medium') return '#ca8a04';
  return '#dc2626';
}

export default function Results({ data }) {
  if (!data) return <Navigate to="/analyze" replace />;

  const {
    executive_summary = '',
    key_legal_issues = [],
    primary_arguments = [],
    counter_arguments_to_anticipate = [],
    recommended_next_steps = [],
    overall_case_strength = '',
    risk_factors = [],
  } = data;

  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (neededHeight) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Header
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    doc.text('COURTROOMAI — LEGAL STRATEGY BRIEF', margin, y);
    y += 6;

    doc.setFont('times', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(110, 110, 110);
    const dateStr = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Generated on ${dateStr} • AI Legal Assistant for Indian Advocates`, margin, y);
    y += 4;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Case Strength
    if (overall_case_strength) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text(`CASE STRENGTH ASSESSMENT: ${overall_case_strength.toUpperCase()}`, margin, y);
      y += 8;
    }

    const addSection = (title, textOrItems, isNumbered = false) => {
      checkPageBreak(16);
      doc.setFont('times', 'bold');
      doc.setFontSize(12.5);
      doc.setTextColor(20, 20, 20);
      doc.text(title, margin, y);
      y += 2;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(45, 45, 45);

      if (isNumbered && Array.isArray(textOrItems)) {
        textOrItems.forEach((item, index) => {
          checkPageBreak(8);
          const itemText = typeof item === 'string' ? item : item.argument || '';
          const strengthText = item.strength ? ` (${item.strength})` : '';
          const lines = doc.splitTextToSize(`${index + 1}. ${itemText}${strengthText}`, contentWidth - 4);
          doc.text(lines, margin + 2, y);
          y += lines.length * 4.8 + 2;

          if (item.supporting_citation) {
            checkPageBreak(6);
            doc.setFont('times', 'italic');
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            const citeLines = doc.splitTextToSize(`Precedent: ${item.supporting_citation}`, contentWidth - 8);
            doc.text(citeLines, margin + 6, y);
            y += citeLines.length * 4.2 + 2;
            doc.setFont('times', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(45, 45, 45);
          }
        });
        y += 3;
      } else if (Array.isArray(textOrItems)) {
        textOrItems.forEach((item) => {
          checkPageBreak(7);
          const lines = doc.splitTextToSize(`• ${item}`, contentWidth - 4);
          doc.text(lines, margin + 2, y);
          y += lines.length * 4.8 + 2;
        });
        y += 3;
      } else if (textOrItems) {
        checkPageBreak(10);
        const lines = doc.splitTextToSize(String(textOrItems), contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 4.8 + 4;
      }
    };

    if (executive_summary) {
      addSection('Executive Summary', executive_summary);
    }
    if (key_legal_issues && key_legal_issues.length > 0) {
      addSection('Key Legal Issues', key_legal_issues, true);
    }
    if (primary_arguments && primary_arguments.length > 0) {
      addSection('Primary Arguments', primary_arguments, true);
    }
    if (counter_arguments_to_anticipate && counter_arguments_to_anticipate.length > 0) {
      addSection('Anticipated Counter-Arguments', counter_arguments_to_anticipate, false);
    }
    if (risk_factors && risk_factors.length > 0) {
      addSection('Risk Factors', risk_factors, false);
    }
    if (recommended_next_steps && recommended_next_steps.length > 0) {
      addSection('Recommended Next Steps', recommended_next_steps, true);
    }

    // Footer Disclaimer
    checkPageBreak(14);
    y += 4;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text('CourtroomAI analysis — not formal legal advice. Verify citations independently before filing.', margin, y);

    doc.save('CourtroomAI_Legal_Strategy_Brief.pdf');
  };

  return (
    <div className="min-h-screen bg-page">
      {/* Top bar */}
      <header className="px-6 py-5 max-w-doc mx-auto flex items-center justify-between">
        <Link to="/" className="font-serif font-semibold text-heading text-lg">
          CourtroomAI
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/analyze"
            className="font-sans text-xs text-muted hover:text-body transition-colors"
          >
            ← New Analysis
          </Link>
          <button
            type="button"
            id="download-pdf-btn"
            onClick={downloadPDF}
            className="bg-heading hover:bg-black text-white font-sans text-xs font-medium px-4 py-2 transition-colors flex items-center gap-1.5 shadow-sm"
            style={{ borderRadius: '3px' }}
            title="Download report as PDF"
          >
            <span>↓</span> Download PDF Report
          </button>
        </div>
      </header>

      {/* Brief content */}
      <main className="max-w-doc mx-auto px-6 pt-4 pb-24">

        {/* ─── Executive Summary ─── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-heading" style={{ fontSize: '22px' }}>
              Executive Summary
            </h2>
            <button
              type="button"
              onClick={downloadPDF}
              className="font-sans text-xs text-muted hover:text-heading underline transition-colors"
            >
              Download PDF
            </button>
          </div>

          {/* Case strength */}
          {overall_case_strength && (
            <p className="mb-4 font-sans text-sm">
              <span
                className="inline-block w-2 h-2 rounded-full mr-2"
                style={{
                  backgroundColor: strengthDot(overall_case_strength),
                  verticalAlign: 'middle',
                }}
              />
              <span className="text-body">
                Assessment: {overall_case_strength}
              </span>
            </p>
          )}

          <p className="text-body font-sans text-base leading-relaxed whitespace-pre-line">
            {executive_summary}
          </p>
        </section>

        <hr className="my-10 border-rule" />

        {/* ─── Key Legal Issues ─── */}
        {key_legal_issues.length > 0 && (
          <section>
            <h2 className="font-serif text-heading mb-3" style={{ fontSize: '22px' }}>
              Key Legal Issues
            </h2>
            <ol className="list-decimal list-outside ml-5 space-y-2">
              {key_legal_issues.map((issue, i) => (
                <li key={i} className="text-body font-sans text-base leading-relaxed pl-1">
                  {issue}
                </li>
              ))}
            </ol>
          </section>
        )}

        <hr className="my-10 border-rule" />

        {/* ─── Primary Arguments ─── */}
        {primary_arguments.length > 0 && (
          <section>
            <h2 className="font-serif text-heading mb-3" style={{ fontSize: '22px' }}>
              Arguments
            </h2>
            <div className="space-y-6">
              {primary_arguments.map((arg, i) => (
                <div key={i}>
                  <p className="text-body font-sans text-base leading-relaxed">
                    <span className="text-muted font-medium mr-1">{i + 1}.</span>
                    {arg.argument}
                    {arg.strength && (
                      <span className="text-muted text-sm ml-1">
                        ({arg.strength})
                      </span>
                    )}
                  </p>
                  {arg.supporting_citation && (
                    <p className="mt-1 text-muted font-sans text-xs uppercase tracking-label">
                      Ref: {arg.supporting_citation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <hr className="my-10 border-rule" />

        {/* ─── Counter Arguments ─── */}
        {counter_arguments_to_anticipate.length > 0 && (
          <section>
            <h2 className="font-serif text-heading mb-3" style={{ fontSize: '22px' }}>
              Anticipated Counter-Arguments
            </h2>
            <div className="space-y-2 ml-4">
              {counter_arguments_to_anticipate.map((arg, i) => (
                <p key={i} className="text-body font-sans text-base leading-relaxed">
                  <span className="text-muted mr-2">—</span>{arg}
                </p>
              ))}
            </div>
          </section>
        )}

        <hr className="my-10 border-rule" />

        {/* ─── Risk Factors ─── */}
        {risk_factors.length > 0 && (
          <section>
            <h2 className="font-serif text-heading mb-3" style={{ fontSize: '22px' }}>
              Risk Factors
            </h2>
            <div className="space-y-2 ml-4">
              {risk_factors.map((risk, i) => (
                <p key={i} className="text-body font-sans text-base leading-relaxed">
                  <span className="text-muted mr-2">—</span>{risk}
                </p>
              ))}
            </div>
          </section>
        )}

        <hr className="my-10 border-rule" />

        {/* ─── Recommended Next Steps ─── */}
        {recommended_next_steps.length > 0 && (
          <section>
            <h2 className="font-serif text-heading mb-3" style={{ fontSize: '22px' }}>
              Recommended Next Steps
            </h2>
            <ol className="list-decimal list-outside ml-5 space-y-2">
              {recommended_next_steps.map((step, i) => (
                <li key={i} className="text-body font-sans text-base leading-relaxed pl-1">
                  {step}
                </li>
              ))}
            </ol>
          </section>
        )}

        <hr className="my-10 border-rule" />

        {/* ─── Footer ─── */}
        <footer className="pt-2">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/analyze"
              className="font-sans text-xs text-muted hover:text-body transition-colors"
            >
              ← Analyze another FIR / case
            </Link>
            <button
              type="button"
              onClick={downloadPDF}
              className="bg-heading hover:bg-black text-white font-sans text-xs font-medium px-4 py-2 transition-colors flex items-center gap-1.5 shadow-sm"
              style={{ borderRadius: '3px' }}
            >
              <span>↓</span> Download PDF Report
            </button>
          </div>
          <p className="text-muted font-sans" style={{ fontSize: '11px', lineHeight: 1.5 }}>
            This analysis was generated by CourtroomAI and does not constitute legal advice.
            All citations and arguments must be independently verified.
          </p>
        </footer>
      </main>
    </div>
  );
}
