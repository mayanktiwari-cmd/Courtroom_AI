import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* Center content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <h1
          className="font-serif font-bold text-heading"
          style={{ fontSize: '56px', lineHeight: 1.1 }}
        >
          CourtroomAI
        </h1>

        <p className="mt-4 text-muted text-base font-sans">
          Legal intelligence for Indian advocates.
        </p>

        <Link
          to="/analyze"
          className="mt-10 inline-block bg-heading text-white font-sans text-sm font-medium px-8 py-3"
          style={{ borderRadius: '4px' }}
        >
          Begin Analysis
        </Link>
      </main>

      {/* Footer disclaimer */}
      <footer className="pb-8 text-center px-6">
        <p className="text-muted font-sans" style={{ fontSize: '11px', lineHeight: 1.5 }}>
          CourtroomAI is an assistive tool only. It does not constitute legal advice.
          <br />
          All outputs must be independently verified by a qualified advocate.
        </p>
      </footer>
    </div>
  );
}
