import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FIRInput from '../components/FIRInput';
import { analyzeCase } from '../api/client';

export default function Analyze({ onAnalysisComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAnalyze = async ({ firText, perspective }) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await analyzeCase({ firText, perspective });
      onAnalysisComplete(data);
      navigate('/results');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail?.error ||
        err.response?.data?.message ||
        'Failed to connect to backend server. Ensure FastAPI backend is active on port 8000.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 sm:px-8 space-y-8">
      {/* Header section with blue rule */}
      <div className="border-b border-border pb-6 space-y-2">
        <div className="section-blue-rule">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#007BFF] font-semibold">
            Evidence Vault & Case Submission
          </span>
        </div>
        <h1 className="font-serif text-3xl font-semibold text-text-main tracking-tighter">
          Startuop v. Meridian Holdings — Case No. 2024-CV-0841
        </h1>
        <p className="text-xs font-mono text-text-muted uppercase tracking-wider">
          Pretrial Conference Scheduled | Courtroom AI Docket Entry
        </p>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="p-8 bg-card shadow-sm border-l-4 border-[#007BFF] text-sm font-mono italic text-[#0047AB] space-y-2">
          <p className="font-semibold">Analyzing precedents…</p>
          <p className="text-xs text-text-muted not-italic">
            Cross-referencing 50,000+ Indian Kanoon judgments, extracting statutory IPC provisions, and executing 70B LLM-as-Judge citation verification.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="p-4 border border-red-200 bg-red-50 text-xs font-mono text-red-700 shadow-sm">
              <span className="font-bold uppercase">System Warning: </span>
              {error}
            </div>
          )}
          <FIRInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
