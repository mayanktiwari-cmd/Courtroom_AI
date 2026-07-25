import React from 'react';
import { motion } from 'framer-motion';

/**
 * Stylised Nyaya Devta — the Indian judiciary statue of Lady Justice
 * holding the scales of balance. Pure SVG for crisp rendering at any size.
 */
export default function NyayaDevtaStatue({ className = '', animate = true }) {
  const MotionG = animate ? motion.g : 'g';

  return (
    <svg
      viewBox="0 0 400 560"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Pedestal */}
      <rect x="120" y="490" width="160" height="20" rx="2" fill="#1A2133" />
      <rect x="100" y="510" width="200" height="16" rx="3" fill="#141B2B" />
      <rect x="80" y="526" width="240" height="24" rx="4" fill="#0F1623" stroke="#2A3548" strokeWidth="1" />

      {/* Draped robe — lower */}
      <path
        d="M148 340 C130 380 118 420 112 460 L112 490 L288 490 L288 460 C282 420 270 380 252 340 Z"
        fill="url(#robeGrad)"
      />
      {/* Robe folds */}
      <path d="M160 360 L148 490" stroke="#8B7355" strokeWidth="0.8" opacity="0.3" />
      <path d="M200 350 L195 490" stroke="#8B7355" strokeWidth="0.8" opacity="0.2" />
      <path d="M240 360 L252 490" stroke="#8B7355" strokeWidth="0.8" opacity="0.3" />

      {/* Torso & upper robe */}
      <path
        d="M168 220 C160 260 152 300 148 340 L252 340 C248 300 240 260 232 220 Z"
        fill="url(#robeGrad)"
      />

      {/* Neck */}
      <rect x="188" y="195" width="24" height="30" rx="4" fill="url(#skinGrad)" />

      {/* Head */}
      <ellipse cx="200" cy="175" rx="32" ry="36" fill="url(#skinGrad)" />

      {/* Hair bun — traditional Indian style */}
      <ellipse cx="200" cy="148" rx="22" ry="16" fill="#2A1F14" />
      <path d="M172 168 C168 155 175 140 200 136 C225 140 232 155 228 168" fill="#2A1F14" />

      {/* Blindfold */}
      <rect x="168" y="168" width="64" height="10" rx="5" fill="#1A2133" opacity="0.85" />
      <path d="M168 173 C180 178 220 178 232 173" stroke="#C4A265" strokeWidth="1.5" fill="none" />

      {/* Left arm — holding scales */}
      <path
        d="M168 230 C140 240 120 260 108 280 L108 290 C115 285 130 278 148 270"
        fill="url(#skinGrad)"
        stroke="#8B7355"
        strokeWidth="0.5"
      />

      {/* Right arm — at side */}
      <path
        d="M232 230 C255 250 265 280 260 310 L252 310 C258 285 248 258 228 240"
        fill="url(#skinGrad)"
        stroke="#8B7355"
        strokeWidth="0.5"
      />

      {/* Scales pole */}
      <MotionG
        {...(animate && {
          animate: { rotate: [-1.5, 1.5, -1.5] },
          transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          style: { transformOrigin: '108px 280px' },
        })}
      >
        <line x1="108" y1="280" x2="108" y2="220" stroke="#C4A265" strokeWidth="2.5" />
        <line x1="108" y1="220" x2="60" y2="235" stroke="#C4A265" strokeWidth="2" />
        <line x1="108" y1="220" x2="156" y2="235" stroke="#C4A265" strokeWidth="2" />

        {/* Left pan */}
        <MotionG
          {...(animate && {
            animate: { rotate: [2, -2, 2] },
            transition: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.1 },
            style: { transformOrigin: '60px 235px' },
          })}
        >
          <path d="M38 235 C38 250 52 258 60 258 C68 258 82 250 82 235" stroke="#C4A265" strokeWidth="1.5" fill="url(#panGrad)" />
          <line x1="38" y1="235" x2="82" y2="235" stroke="#C4A265" strokeWidth="1.5" />
          <line x1="60" y1="235" x2="60" y2="248" stroke="#C4A265" strokeWidth="1" opacity="0.5" />
        </MotionG>

        {/* Right pan */}
        <MotionG
          {...(animate && {
            animate: { rotate: [-2, 2, -2] },
            transition: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.1 },
            style: { transformOrigin: '156px 235px' },
          })}
        >
          <path d="M134 235 C134 250 148 258 156 258 C164 258 178 250 178 235" stroke="#C4A265" strokeWidth="1.5" fill="url(#panGrad)" />
          <line x1="134" y1="235" x2="178" y2="235" stroke="#C4A265" strokeWidth="1.5" />
          <line x1="156" y1="235" x2="156" y2="248" stroke="#C4A265" strokeWidth="1" opacity="0.5" />
        </MotionG>
      </MotionG>

      {/* Saree pallu drape over shoulder */}
      <path
        d="M228 220 C250 240 260 280 255 320 C250 300 240 260 232 240 Z"
        fill="url(#palluGrad)"
        opacity="0.9"
      />

      {/* Decorative waist band */}
      <rect x="148" y="330" width="104" height="8" rx="2" fill="#C4A265" opacity="0.6" />

      {/* Glow aura behind statue */}
      <ellipse cx="200" cy="320" rx="120" ry="180" fill="url(#auraGrad)" opacity="0.4" />

      <defs>
        <linearGradient id="robeGrad" x1="200" y1="220" x2="200" y2="490" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3D4F6B" />
          <stop offset="0.5" stopColor="#2A3548" />
          <stop offset="1" stopColor="#1A2133" />
        </linearGradient>
        <linearGradient id="palluGrad" x1="240" y1="220" x2="255" y2="320" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4A265" stopOpacity="0.3" />
          <stop offset="1" stopColor="#8B7355" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="200" y1="140" x2="200" y2="230" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4A574" />
          <stop offset="1" stopColor="#B8895A" />
        </linearGradient>
        <linearGradient id="panGrad" x1="60" y1="235" x2="60" y2="258" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4A265" stopOpacity="0.15" />
          <stop offset="1" stopColor="#8B7355" stopOpacity="0.05" />
        </linearGradient>
        <radialGradient id="auraGrad" cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#C4A265" stopOpacity="0.2" />
          <stop offset="1" stopColor="#C4A265" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
