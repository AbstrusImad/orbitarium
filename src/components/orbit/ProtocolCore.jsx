/*
  ProtocolCore.jsx
  The central star: protocol core with treasury halo.
*/
import React from 'react'
import { motion } from 'framer-motion'

export default function ProtocolCore({ x, y, name, selected, onSelect, reduced }) {
  return (
    <g style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onSelect && onSelect() }}>
      <defs>
        <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--bone)" />
          <stop offset="45%" stopColor="var(--sage)" />
          <stop offset="100%" stopColor="rgba(107,159,227,0)" />
        </radialGradient>
      </defs>
      {!reduced && (
        <motion.circle
          cx={x}
          cy={y}
          r={42}
          fill="url(#coreGrad)"
          opacity={0.32}
          animate={{ r: [40, 46, 40], opacity: [0.28, 0.4, 0.28] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <circle cx={x} cy={y} r={26} fill="url(#coreGrad)" opacity={0.5} />
      <circle cx={x} cy={y} r={13} fill="var(--bone)" />
      <circle cx={x} cy={y} r={13} fill="none" stroke={selected ? 'var(--champagne)' : 'var(--line3)'} strokeWidth={selected ? 2 : 1} />
      <text x={x} y={y + 38} textAnchor="middle" className="mono" style={{ fontSize: 12, fill: 'var(--bone)' }}>
        {name || 'Protocol Core'}
      </text>
      <text x={x} y={y + 53} textAnchor="middle" className="mono" style={{ fontSize: 9, fill: 'var(--ash)', letterSpacing: '0.15em' }}>
        CORE
      </text>
    </g>
  )
}
