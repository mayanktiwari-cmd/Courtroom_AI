import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { uploadPDF } from '../api/client';

export default function FIRInput({ onAnalyze, isLoading }) {
  const [firText, setFirText] = useState('');
  const [perspective, setPerspective] = useState('defense');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    setUploading(true);
    setError(null);
    setUploadSuccess(null);

    try {
      const res = await uploadPDF(file);
      if (res.text) {
        setFirText(res.text);
        setUploadSuccess(`Uploaded ${file.name} — ${res.num_pages} pages parsed`);
      }
    } catch (err) {
      setError(err.response?.data?.detail?.error || 'Failed to parse PDF file');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firText.trim() || firText.length < 20) {
      setError('Please enter at least 20 characters of FIR text or upload a PDF.');
      return;
    }
    setError(null);
    onAnalyze({ firText, perspective });
  };

  const loadSampleFIR = () => {
    setFirText(`FIR No. 342/2024 — Startuop v. Meridian Holdings
Police Station: Sector 20, Noida
Under Sections: 420, 468, 471, 120B IPC

The complainant alleged that the accused dishonestly induced him to transfer ₹45 Lakhs under false promises of residential flat allotment. It is further alleged that forged sanction letters of Noida Authority were produced. The accused claims to be a mere sleeping partner in the firm with no direct role in transactions or cheque signing.`);
    setPerspective('defense');
    setError(null);
  };

  return (
    <div className="bg-card shadow-sm border border-border p-6 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#007BFF] font-semibold block mb-1">
            Docket Filing Interface
          </span>
          <h2 className="font-serif text-xl font-normal text-text-main">Document Input & Evidence Brief</h2>
          <p className="text-xs text-text-muted mt-1 font-sans">
            Paste text or upload a PDF FIR, charge sheet, or legal notice.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSampleFIR}
          className="text-xs font-mono uppercase tracking-wider font-semibold px-4 py-2 border border-[#007BFF] text-[#007BFF] hover:bg-[#007BFF] hover:text-white transition-colors self-start"
        >
          Load Sample Case FIR
        </button>
      </div>

      {/* PDF Dropzone */}
      <div
        {...getRootProps()}
        className={`border border-dashed p-8 text-center cursor-pointer transition bg-surface ${
          isDragActive
            ? 'border-[#007BFF] bg-blue-50'
            : 'border-border hover:border-[#007BFF]'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-6 h-6 text-[#007BFF] mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-xs font-mono text-text-main">
          {uploading ? (
            <span className="text-[#007BFF] font-semibold">Parsing PDF with pdfplumber...</span>
          ) : isDragActive ? (
            <span className="text-[#007BFF] font-semibold">Drop file here</span>
          ) : (
            <>Drag &amp; drop a PDF FIR, or <span className="text-[#007BFF] underline font-semibold">browse file</span></>
          )}
        </p>
        <p className="text-[10px] font-mono text-text-muted mt-1.5 uppercase">PDF up to 15MB</p>
      </div>

      {uploadSuccess && (
        <div className="p-3 border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-mono flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-semibold">{uploadSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3 border border-red-200 bg-red-50 text-xs font-mono text-red-700 shadow-sm">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 inline mr-2" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[#0047AB] font-bold mb-2">
            FIR / Case Details Text
          </label>
          <textarea
            rows={8}
            value={firText}
            onChange={(e) => setFirText(e.target.value)}
            placeholder="Paste complete FIR text, statement of facts, or legal notice details..."
            className="w-full bg-surface border border-border p-4 text-sm text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-1 focus:ring-[#007BFF]/50 transition resize-y font-mono leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[#0047AB] font-bold mb-2">
            Advocate Perspective
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPerspective('defense')}
              className={`p-3 border text-xs font-mono font-semibold uppercase tracking-wider transition ${
                perspective === 'defense'
                  ? 'border-[#007BFF] bg-blue-50 text-[#007BFF]'
                  : 'border-border text-text-muted hover:text-text-main hover:border-[#007BFF]/50 bg-surface'
              }`}
            >
              Defense Strategy
            </button>
            <button
              type="button"
              onClick={() => setPerspective('prosecution')}
              className={`p-3 border text-xs font-mono font-semibold uppercase tracking-wider transition ${
                perspective === 'prosecution'
                  ? 'border-[#007BFF] bg-blue-50 text-[#007BFF]'
                  : 'border-border text-text-muted hover:text-text-main hover:border-[#007BFF]/50 bg-surface'
              }`}
            >
              Prosecution Strategy
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || uploading}
          className="w-full py-4 bg-[#007BFF] text-white hover:bg-[#005CE6] disabled:opacity-40 disabled:hover:bg-[#007BFF] font-mono text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
        >
          {isLoading ? 'Analyzing Precedents…' : 'Generate Case Strategy & Verify Citations'}
        </button>
      </form>
    </div>
  );
}
