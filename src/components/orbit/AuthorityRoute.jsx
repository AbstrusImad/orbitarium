/*
  AuthorityRoute.jsx
  An illuminated route from the core to a body, lighting up on hover/active.
*/
import React from 'react'

const TONE = {
  crimson: 'var(--crimson)',
  ember: 'var(--ember)',
  sage: 'var(--sage)',
  champagne: 'var(--champagne)'
}

export default function AuthorityRoute({ x1, y1, x2, y2, tone = 'sage', active, risk }) {
  const color = risk === 'emergency' ? TONE.crimson : TONE[tone] || TONE.sage
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={active ? 1.8 : 1}
      strokeOpacity={active ? 0.8 : 0.22}
      style={active ? { filter: `drop-shadow(0 0 4px ${color})` } : undefined}
    />
  )
}
