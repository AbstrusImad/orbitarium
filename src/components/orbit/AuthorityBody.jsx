/*
  AuthorityBody.jsx
  A role rendered as a planet. Mass scales with authority weight. Supports
  selection and pointer dragging (radial) in the interactive canvas.
*/
import React from 'react'
import { motion } from 'framer-motion'

const TONE = {
  crimson: 'var(--crimson)',
  ember: 'var(--ember)',
  sage: 'var(--sage)',
  champagne: 'var(--champagne)'
}

export default function AuthorityBody({ role, pos, selected, overloaded, onSelect, onPointerDown, reduced }) {
  const color = TONE[role.tone] || TONE.sage
  const size = 12 + (role.authorityWeight || 40) * 0.16
  return (
    <g
      style={{ cursor: 'grab' }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect && onSelect()
      }}
      onPointerDown={(e) => onPointerDown && onPointerDown(e)}
    >
      {/* mass glow */}
      <circle cx={pos.x} cy={pos.y} r={size + 10} fill={color} opacity={overloaded ? 0.22 : 0.12} />
      {!reduced && overloaded && (
        <motion.circle
          cx={pos.x}
          cy={pos.y}
          r={size + 6}
          fill="none"
          stroke={'var(--crimson)'}
          strokeWidth={1}
          animate={{ r: [size + 6, size + 14, size + 6], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
      )}
      <circle cx={pos.x} cy={pos.y} r={size} fill={color} opacity={0.9} />
      <circle cx={pos.x} cy={pos.y} r={size} fill="none" stroke={selected ? 'var(--bone)' : 'var(--line3)'} strokeWidth={selected ? 2 : 1} />
      <circle cx={pos.x - size * 0.3} cy={pos.y - size * 0.3} r={size * 0.3} fill="var(--bone)" opacity={0.25} />
      <text x={pos.x} y={pos.y + size + 14} textAnchor="middle" className="mono" style={{ fontSize: 11, fill: 'var(--bone2)' }}>
        {role.name}
      </text>
    </g>
  )
}
