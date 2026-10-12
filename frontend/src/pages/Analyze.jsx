import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { analyzeCase } from '../api/client';

export default function Analyze({ onAnalysisComplete }) {
  const [firText, setFirText] = useState('');
  const [perspective, setPerspective] = useState('defense');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firText.trim() || firText.trim().length < 20) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await analyzeCase({ firText, perspective });
      onAnalysisComplete(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Analysis failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page">
      {/* Top bar */}
      <header className="px-6 py-5 max-w-doc mx-auto">
        <Link to="/" className="font-serif font-semibold text-heading text-lg">
          CourtroomAI
        </Link>
      </header>

      {/* Form */}
      <main className="max-w-doc mx-auto px-6 pt-8 pb-24">
        <form onSubmit={handleSubmit}>
          {/* Textarea */}
          <label
            htmlFor="fir-input"
            className="block font-sans text-muted uppercase text-xs tracking-label mb-3"
          >
            Describe the case
          </label>
          <textarea
            id="fir-input"
            value={firText}
            onChange={(e) => setFirText(e.target.value)}
            placeholder="Paste the FIR text, legal notice, or describe the facts of the case…"
            rows={10}
            className="w-full border border-rule bg-white text-body font-sans text-base p-4 resize-y focus:outline-none focus:border-heading"
            style={{ borderRadius: '2px', lineHeight: 1.7 }}
          />

          {/* Perspective toggle */}
          <div className="mt-8">
            <span className="block font-sans text-muted uppercase text-xs tracking-label mb-3">
              Perspective
            </span>
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => setPerspective('defense')}
                className={`font-sans text-sm pb-1 border-b-2 transition-colors ${
                  perspective === 'defense'
                    ? 'text-heading border-heading font-medium'
                    : 'text-muted border-transparent hover:text-body'
                }`}
              >
                Defense
              </button>
              <button
                type="button"
                onClick={() => setPerspective('prosecution')}
                className={`font-sans text-sm pb-1 border-b-2 transition-colors ${
                  perspective === 'prosecution'
                    ? 'text-heading border-heading font-medium'
                    : 'text-muted border-transparent hover:text-body'
                }`}
              >
                Prosecution
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-6 text-sm text-red-600 font-sans">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || firText.trim().length < 20}
            className="mt-10 bg-heading text-white font-sans text-sm font-medium px-8 py-3 disabled:opacity-40"
            style={{ borderRadius: '4px' }}
          >
            {isLoading ? 'Analyzing…' : 'Generate Strategy'}
          </button>

          {/* Loading state */}
          {isLoading && (
            <p className="mt-4 text-muted text-sm font-sans">
              Running IPC mapping, retrieval, citation verification, and strategy synthesis.
              <br />
              This typically takes 30–90 seconds.
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
