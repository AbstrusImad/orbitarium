/*
  CommunityDistanceMeter.jsx
  A linear orbital track showing how far the community sits from the core.
*/
import React from 'react'
import { motion } from 'framer-motion'

export default function CommunityDistanceMeter({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, value))
  const tone = pct >= 60 ? 'var(--crimson)' : pct >= 40 ? 'var(--champagne)' : 'var(--sage)'
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-bone2">Community Distance</span>
        <span className="mono text-xs tabular" style={{ color: tone }}>{Math.round(pct)}</span>
      </div>
      <div className="relative h-7 rounded-full overflow-hidden hairline" style={{ background: 'var(--ink1)' }}>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full" style={{ width: 10, height: 10, background: 'var(--sage)', boxShadow: '0 0 8px var(--sage)' }} />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 12, height: 12, background: tone, boxShadow: `0 0 10px ${tone}` }}
          initial={{ left: '8px' }}
          animate={{ left: `calc(${pct}% - 6px)` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <div className="absolute inset-y-0 left-3 right-3 flex items-center">
          <div className="w-full border-t border-dashed" style={{ borderColor: 'var(--line2)' }} />
        </div>
      </div>
    </div>
  )
}
