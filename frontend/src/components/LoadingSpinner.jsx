import React, { useState, useEffect } from 'react';
import { Scale, Cpu, Search, ShieldCheck, FileText } from 'lucide-react';

const STEPS = [
  { icon: FileText, label: 'Parsing FIR and extracting legal facts' },
  { icon: Cpu, label: 'Mapping applicable IPC sections' },
  { icon: Search, label: 'Retrieving precedents from Indian Kanoon' },
  { icon: ShieldCheck, label: 'Verifying citations via LLM-as-judge' },
  { icon: Scale, label: 'Synthesizing advocate strategy' },
];

export default function LoadingSpinner() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const StepIcon = STEPS[currentStep].icon;

  return (
    <div className="card p-12 text-center flex flex-col items-center justify-center min-h-[360px]">
      <div className="relative mb-8">
        <div className="w-16 h-16 border-2 border-legal-border border-t-legal-gold animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-legal-gold">
          <StepIcon className="w-6 h-6" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="text-base font-semibold text-legal-cream mb-2">Analyzing case</h3>
      <p className="text-sm text-legal-gold/80 font-light mb-8 max-w-sm">
        {STEPS[currentStep].label}
      </p>

      <div className="flex items-center gap-1.5">
        {STEPS.map((_, idx) => (
          <div
            key={idx}
            className={`h-0.5 transition-all duration-500 ${
              idx === currentStep
                ? 'w-8 bg-legal-gold'
                : idx < currentStep
                ? 'w-3 bg-emerald-500/60'
                : 'w-3 bg-legal-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
