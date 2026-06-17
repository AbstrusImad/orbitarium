/*
  VoidEntryCore.jsx
  The small luminous core shown on the Void Entry, with very subtle orbital
  lines and a slow drift. Minimal by design.
*/
import React from 'react'
import { motion } from 'framer-motion'
import { useMotionPrefs } from '../../state/useMotionPrefs.js'

export default function VoidEntryCore() {
  const { reduced } = useMotionPrefs()
  return (
    <div className="relative" style={{ width: 280, height: 280 }}>
      <svg width="280" height="280" viewBox="0 0 280 280">
        <defs>
          <radialGradient id="voidCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--bone)" />
            <stop offset="40%" stopColor="var(--sage)" />
            <stop offset="100%" stopColor="rgba(107,159,227,0)" />
          </radialGradient>
        </defs>
        {[64, 100, 132].map((r, i) => (
          <motion.circle
            key={r}
            cx="140"
            cy="140"
            r={r}
            fill="none"
            stroke="var(--line2)"
            strokeWidth="1"
            initial={reduced ? false : { opacity: 0 }}
            animate={reduced ? { opacity: 0.6 } : { opacity: 0.6 }}
            transition={{ delay: i * 0.2, duration: 1.2 }}
          />
        ))}
        {!reduced &&
          [64, 100, 132].map((r, i) => (
            <motion.circle
              key={`p${r}`}
              cx="140"
              cy={140 - r}
              r={2.4}
              fill={i === 1 ? 'var(--champagne)' : 'var(--sage)'}
              animate={{ rotate: 360 }}
              transition={{ duration: 18 + i * 10, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '140px 140px' }}
            />
          ))}
        <motion.circle
          cx="140"
          cy="140"
          r="30"
          fill="url(#voidCore)"
          animate={reduced ? undefined : { r: [28, 34, 28], opacity: [0.6, 0.85, 0.6] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle cx="140" cy="140" r="9" fill="var(--bone)" />
      </svg>
    </div>
  )
}
