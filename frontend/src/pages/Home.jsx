import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scale,
  Search,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Gavel,
  FileText,
} from 'lucide-react';
import LandingIntro from '../components/LandingIntro';


const FEATURES = [
  {
    icon: Search,
    title: 'Hybrid Case Retrieval',
    description:
      'BM25 exact-match combined with dense BGE embeddings across 50M+ Indian Kanoon judgments.',
  },
  {
    icon: ShieldCheck,
    title: 'Citation Verification',
    description:
      'Every precedent is validated by an LLM-as-judge pipeline before it reaches your strategy.',
  },
  {
    icon: Gavel,
    title: 'Advocate Strategy',
    description:
      'Structured arguments, counter-arguments, IPC mapping, and next steps — tailored to your perspective.',
  },
  {
    icon: BookOpen,
    title: 'Statutory Mapping',
    description:
      'Automatic identification of applicable IPC sections, punishments, and statutory provisions.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Home({ onIntroComplete }) {
  const navigate = useNavigate();
  const [introDone, setIntroDone] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroDone(true);
    onIntroComplete?.();
  }, [onIntroComplete]);

  return (
    <>
      {!introDone && <LandingIntro onComplete={handleIntroComplete} />}

      <div className="relative overflow-hidden">
        {/* Background statue watermark */}
        <div
          className={`absolute inset-0 flex items-start justify-center pointer-events-none transition-opacity duration-1000 ${
            introDone ? 'opacity-[0.04]' : 'opacity-0'
          }`}
          aria-hidden="true"
        >
          <img src="/nyaya_devi.png" alt="" className="w-[700px] h-auto mt-[-60px] object-contain" />
        </div>

        {/* Hero */}
        <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-28 sm:pt-28 sm:pb-36">
          <motion.div
            initial="hidden"
            animate={introDone ? 'visible' : 'hidden'}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 mb-8">
              <div className="h-px w-8 bg-legal-gold/50" />
              <span className="text-xs uppercase tracking-[0.2em] text-legal-muted font-medium">
                Legal Intelligence Platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl text-legal-cream leading-[1.08] tracking-tight mb-6"
            >
              Case strategy,
              <br />
              <span className="text-legal-gold">grounded in law.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg sm:text-xl text-legal-muted leading-relaxed max-w-xl mb-10 font-light"
            >
              Upload an FIR or legal notice. CourtroomAI cross-references millions of
              judgments, verifies every citation, and delivers a structured advocate strategy.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/analyze')}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-legal-gold text-legal-dark text-sm font-semibold tracking-wide hover:bg-legal-gold-light transition-colors duration-200"
              >
                Begin Analysis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <div className="flex items-center gap-2 text-xs text-legal-muted">
                <Scale className="w-3.5 h-3.5 text-legal-gold/60" />
                <span>Defense &amp; prosecution perspectives</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats bar */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={introDone ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="border-y border-legal-border/60 bg-legal-surface/50"
        >
          <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50M+', label: 'Judgments indexed' },
              { value: '70B', label: 'Verification model' },
              { value: '5-step', label: 'Agent pipeline' },
              { value: '100%', label: 'Citation checked' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-2xl sm:text-3xl text-legal-cream mb-1">{stat.value}</p>
                <p className="text-xs text-legal-muted uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Features */}
        <section className="relative max-w-6xl mx-auto px-6 py-24 sm:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-16"
          >
            <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 mb-4">
              <FileText className="w-4 h-4 text-legal-gold/70" />
              <span className="text-xs uppercase tracking-[0.2em] text-legal-muted font-medium">
                Platform Capabilities
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-serif text-3xl sm:text-4xl text-legal-cream tracking-tight"
            >
              Built for the practice of law
            </motion.h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-px bg-legal-border/40">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                custom={i}
                className="bg-legal-dark p-8 sm:p-10 group hover:bg-legal-surface/30 transition-colors duration-300"
              >
                <feature.icon className="w-5 h-5 text-legal-gold mb-5" strokeWidth={1.5} />
                <h3 className="text-base font-semibold text-legal-cream mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-legal-muted leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative border-t border-legal-border/60">
          <div className="max-w-6xl mx-auto px-6 py-20 sm:py-24 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-legal-cream mb-2 tracking-tight">
                Ready to analyze your case?
              </h2>
              <p className="text-sm text-legal-muted">
                Upload a PDF or paste FIR text. Results in under two minutes.
              </p>
            </div>
            <button
              onClick={() => navigate('/analyze')}
              className="inline-flex items-center gap-2 px-6 py-3 border border-legal-gold/40 text-legal-gold text-sm font-medium hover:bg-legal-gold/5 transition-colors duration-200 shrink-0"
            >
              Start Legal Analysis
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
