/*
  ConstraintRing.jsx
  Renders a constraint as a distinct visual form anchored on a power position.
  form values: slow-orbit, fading-body, transparent-ring, interceptor,
  key-constellation, containment-field, mass-ring, rotating-orbit, closed-gate.
*/
import React from 'react'
import { motion } from 'framer-motion'

export default function ConstraintRing({ constraint, pos, reduced, index = 0 }) {
  if (!pos) return null
  const { form } = constraint
  const r = 16 + index * 5
  const stroke = 'var(--champagne)'

  if (form === 'key-constellation') {
    const pts = [0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2
      return { x: pos.x + Math.cos(a) * (r + 2), y: pos.y + Math.sin(a) * (r + 2) }
    })
    return (
      <g opacity={0.85}>
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2} fill={stroke} />
        ))}
        {pts.map((p, i) => {
          const n = pts[(i + 1) % pts.length]
          return <line key={`l${i}`} x1={p.x} y1={p.y} x2={n.x} y2={n.y} stroke={stroke} strokeWidth={0.6} strokeOpacity={0.4} />
        })}
      </g>
    )
  }

  if (form === 'containment-field') {
    return <rect x={pos.x - r} y={pos.y - r} width={r * 2} height={r * 2} rx={5} fill="var(--champagne-glow)" stroke={stroke} strokeWidth={0.8} strokeOpacity={0.6} />
  }

  if (form === 'closed-gate') {
    return (
      <g opacity={0.8}>
        <line x1={pos.x - r} y1={pos.y - r} x2={pos.x - r} y2={pos.y + r} stroke={stroke} strokeWidth={1.2} />
        <line x1={pos.x + r} y1={pos.y - r} x2={pos.x + r} y2={pos.y + r} stroke={stroke} strokeWidth={1.2} />
        <line x1={pos.x - r} y1={pos.y} x2={pos.x + r} y2={pos.y} stroke={stroke} strokeWidth={0.8} strokeDasharray="2 2" />
      </g>
    )
  }

  if (form === 'fading-body') {
    return (
      <motion.circle
        cx={pos.x}
        cy={pos.y}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={1}
        strokeDasharray="3 3"
        animate={reduced ? undefined : { opacity: [0.7, 0.2, 0.7] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    )
  }

  if (form === 'interceptor') {
    return (
      <g>
        <circle cx={pos.x} cy={pos.y} r={r} fill="none" stroke={stroke} strokeWidth={0.8} strokeDasharray="6 4" />
        <circle cx={pos.x + r} cy={pos.y} r={2.5} fill={stroke} />
      </g>
    )
  }

  // transparent-ring, mass-ring, slow-orbit, rotating-orbit default
  return (
    <motion.circle
      cx={pos.x}
      cy={pos.y}
      r={r}
      fill={form === 'mass-ring' ? 'var(--champagne-glow)' : 'none'}
      stroke={stroke}
      strokeWidth={1}
      strokeOpacity={0.7}
      animate={reduced ? undefined : { rotate: form === 'rotating-orbit' ? 360 : 0 }}
      transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
    />
  )
}
