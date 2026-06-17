/*
  RiskBadge.jsx
  Compact badge for a risk level. Not a generic pill: uses orbital tones.
*/
import React from 'react'

const MAP = {
  normal: { label: 'Normal', color: 'var(--sage)', glow: 'var(--sage-glow)' },
  sensitive: { label: 'Sensitive', color: 'var(--ember)', glow: 'var(--ember-glow)' },
  emergency: { label: 'Emergency', color: 'var(--crimson)', glow: 'var(--crimson-glow)' }
}

export default function RiskBadge({ level = 'normal', small = false }) {
  const m = MAP[level] || MAP.normal
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full mono uppercase tracking-wider ${small ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'}`}
      style={{ color: m.color, background: m.glow, border: `1px solid ${m.color}` }}
    >
      <span className="inline-block rounded-full" style={{ width: 5, height: 5, background: m.color }} />
      {m.label}
    </span>
  )
}
