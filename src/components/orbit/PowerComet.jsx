/*
  PowerComet.jsx
  A power rendered as a comet marker on its authority route. Emergency powers
  glow crimson; sensitive in ember; normal in sage.
*/
import React from 'react'
import { motion } from 'framer-motion'

const TONE = { normal: 'var(--sage)', sensitive: 'var(--ember)', emergency: 'var(--crimson)' }

export default function PowerComet({ power, pos, selected, onSelect, reduced }) {
  const color = TONE[power.riskLevel] || TONE.normal
  return (
    <g
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect && onSelect()
      }}
    >
      {!reduced && power.riskLevel === 'emergency' && (
        <motion.circle
          cx={pos.x}
          cy={pos.y}
          r={9}
          fill="none"
          stroke={color}
          strokeWidth={1}
          animate={{ r: [7, 13, 7], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      )}
      <circle cx={pos.x} cy={pos.y} r={selected ? 7 : 5} fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
      <circle cx={pos.x} cy={pos.y} r={selected ? 7 : 5} fill="none" stroke={selected ? 'var(--bone)' : 'transparent'} strokeWidth={1.5} />
      <text x={pos.x} y={pos.y - 11} textAnchor="middle" className="mono" style={{ fontSize: 9, fill: 'var(--ash)' }}>
        {power.name}
      </text>
    </g>
  )
}
