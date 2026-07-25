import React from 'react';
import CaseBriefPanel from '../components/CaseBriefPanel';
import ArgumentWorkspace from '../components/ArgumentWorkspace';

export default function Workspace({ onAnalyze, isLoading, analysisData }) {
  return (
    <div className="h-screen w-full flex overflow-hidden bg-surface">
      {/* 35% Left Column: Case Brief & Docket */}
      <div className="w-[35%] min-w-[320px] max-w-[440px] h-full shrink-0 hidden md:block border-r border-border">
        <CaseBriefPanel />
      </div>

      {/* 65% Right Column: Live AI Argument Workspace */}
      <div className="flex-1 h-full flex flex-col min-w-0">
        <ArgumentWorkspace
          onAnalyze={onAnalyze}
          isLoading={isLoading}
          analysisData={analysisData}
        />
      </div>
    </div>
  );
}
