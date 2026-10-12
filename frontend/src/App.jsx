import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Results from './pages/Results';

function AppRoutes() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const navigate = useNavigate();

  const handleAnalysisComplete = (data) => {
    setAnalysisResult(data);
    navigate('/results');
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/analyze"
        element={<Analyze onAnalysisComplete={handleAnalysisComplete} />}
      />
      <Route
        path="/results"
        element={<Results data={analysisResult} />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
