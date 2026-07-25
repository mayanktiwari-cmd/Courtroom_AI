import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INTRO_DURATION = 4200;

export default function LandingIntro({ onComplete }) {
  const [phase, setPhase] = useState('enter'); // enter | hold | exit | done

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete?.();
      setPhase('done');
      return;
    }

    const holdTimer = setTimeout(() => setPhase('hold'), 1800);
    const exitTimer = setTimeout(() => setPhase('exit'), 3200);
    const doneTimer = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, INTRO_DURATION);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#060A12]"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Ambient radial glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'exit' ? 0 : 1 }}
          transition={{ duration: 1.2 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-legal-gold/[0.06] blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[300px] h-[400px] rounded-full bg-legal-gold/[0.04] blur-[80px]" />
        </motion.div>

        {/* Light rays */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'hold' || phase === 'enter' ? 0.6 : 0 }}
          transition={{ duration: 1.5, delay: 0.8 }}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 left-1/2 origin-top"
              style={{
                transform: `translateX(-50%) rotate(${(i - 2) * 12}deg)`,
                width: '2px',
                height: '60%',
                background: 'linear-gradient(to bottom, rgba(196,162,101,0.15), transparent)',
              }}
            />
          ))}
        </motion.div>

        {/* Statue container — now using realistic PNG */}
        <motion.div
          className="relative flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.85, y: 40 }}
          animate={
            phase === 'exit'
              ? { opacity: 0, scale: 1.15, y: -60, filter: 'blur(8px)' }
              : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
          }
          transition={{
            duration: phase === 'exit' ? 1 : 1.8,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <img
            src="/nyaya_devi.png"
            alt="Nyaya Devi — Goddess of Justice"
            className="w-64 sm:w-80 md:w-96 h-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 60px rgba(196,162,101,0.15))' }}
          />

          {/* Title reveal */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{
              opacity: phase === 'exit' ? 0 : 1,
              y: phase === 'exit' ? -10 : 0,
            }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <p className="text-[11px] uppercase tracking-[0.35em] text-legal-gold/70 font-medium mb-2">
              Nyaya Devi
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-legal-cream font-light tracking-wide">
              Goddess of Justice
            </h2>
          </motion.div>
        </motion.div>

        {/* Bottom vignette */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#060A12] to-transparent pointer-events-none" />

        {/* Curtain wipe on exit */}
        <motion.div
          className="absolute inset-0 bg-[#060A12] pointer-events-none"
          initial={{ scaleY: 0, originY: 1 }}
          animate={{ scaleY: phase === 'exit' ? 1 : 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ transformOrigin: 'bottom' }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
