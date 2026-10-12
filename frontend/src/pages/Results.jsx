import React from 'react';
import { Link, Navigate } from 'react-router-dom';

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

  return (
    <div className="min-h-screen bg-page">
      {/* Top bar */}
      <header className="px-6 py-5 max-w-doc mx-auto flex items-center justify-between">
        <Link to="/" className="font-serif font-semibold text-heading text-lg">
          CourtroomAI
        </Link>
        <Link
          to="/analyze"
          className="font-sans text-xs text-muted hover:text-body transition-colors"
        >
          New Analysis
        </Link>
      </header>

      {/* Brief content */}
      <main className="max-w-doc mx-auto px-6 pt-4 pb-24">

        {/* ─── Executive Summary ─── */}
        <section>
          <h2 className="font-serif text-heading mb-3" style={{ fontSize: '22px' }}>
            Executive Summary
          </h2>

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
          <p className="text-muted font-sans" style={{ fontSize: '11px', lineHeight: 1.5 }}>
            This analysis was generated by CourtroomAI and does not constitute legal advice.
            All citations and arguments must be independently verified.
          </p>
        </footer>
      </main>
    </div>
  );
}
