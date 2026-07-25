import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import Workspace from './pages/Workspace';
import Analyze from './pages/Analyze';
import Results from './pages/Results';
import { analyzeCase } from './api/client';

const queryClient = new QueryClient();

function MainLayout() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async ({ firText, perspective }) => {
    setIsLoading(true);
    try {
      const data = await analyzeCase({ firText, perspective });
      setAnalysisData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-text-main flex">
      {/* Fixed Left Sidebar (64px collapsed, 220px hover) */}
      <Sidebar />

      {/* Main Content Area — Offset by 64px for sidebar */}
      <main className="flex-1 pl-[64px] min-h-screen flex flex-col min-w-0 overflow-hidden">
        <Routes>
          <Route
            path="/"
            element={
              <Workspace
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                analysisData={analysisData}
              />
            }
          />
          <Route
            path="/cases"
            element={
              <Workspace
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                analysisData={analysisData}
              />
            }
          />
          <Route
            path="/analyze"
            element={
              <Analyze
                onAnalysisComplete={(data) => setAnalysisData(data)}
              />
            }
          />
          <Route
            path="/results"
            element={<Results analysisData={analysisData} />}
          />
          <Route
            path="/precedents"
            element={
              <Workspace
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                analysisData={analysisData}
              />
            }
          />
          <Route
            path="/hearings"
            element={
              <Workspace
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                analysisData={analysisData}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <Workspace
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                analysisData={analysisData}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <MainLayout />
      </Router>
    </QueryClientProvider>
  );
}
