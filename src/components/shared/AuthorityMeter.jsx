/*
  AuthorityMeter.jsx
  Radial arc meter for a 0-100 score. Used for gravity metrics.
*/
import React from 'react'
import { motion } from 'framer-motion'

function toneFor(value, invert) {
  const v = invert ? 100 - value : value
  if (v >= 66) return 'var(--sage)'
  if (v >= 40) return 'var(--champagne)'
  return 'var(--crimson)'
}

export default function AuthorityMeter({ label, value = 0, invert = false, size = 96, sub }) {
  const r = size / 2 - 8
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))
  const dash = (pct / 100) * c
  const color = toneFor(pct, invert)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line2)" strokeWidth="4" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            initial={{ strokeDasharray: `0 ${c}` }}
            animate={{ strokeDasharray: `${dash} ${c}` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="mono text-xl tabular" style={{ color }}>{Math.round(pct)}</span>
          {sub && <span className="mono text-[9px] text-ash uppercase">{sub}</span>}
        </div>
      </div>
      {label && <span className="text-[11px] text-bone2 text-center max-w-[110px] leading-tight">{label}</span>}
    </div>
  )
}
