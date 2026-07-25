import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale } from 'lucide-react';

export default function Navbar({ hidden = false }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  if (hidden) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-legal-border/50 bg-legal-dark/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5 group">
            <Scale className="w-[18px] h-[18px] text-legal-gold" strokeWidth={1.5} />
            <span className="text-[15px] font-semibold tracking-tight text-legal-cream">
              Courtroom<span className="text-legal-gold font-normal">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-8">
            <Link
              to="/"
              className={`text-[13px] font-medium transition-colors ${
                isActive('/') ? 'text-legal-cream' : 'text-legal-muted hover:text-legal-text'
              }`}
            >
              Home
            </Link>
            <Link
              to="/analyze"
              className={`text-[13px] font-medium transition-colors ${
                isActive('/analyze') || isActive('/results')
                  ? 'text-legal-cream'
                  : 'text-legal-muted hover:text-legal-text'
              }`}
            >
              Analyze
            </Link>
            <Link
              to="/analyze"
              className="hidden sm:inline-flex text-[13px] font-medium px-4 py-1.5 bg-legal-gold text-legal-dark hover:bg-legal-gold-light transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
