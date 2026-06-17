/*
  SafeguardBelt.jsx
  An orbital belt representing community review coverage. Denser dots mean more
  coverage. Rendered as a ring of small particles around the core.
*/
import React from 'react'
import { motion } from 'framer-motion'
import { VIEW } from './orbitLayout.js'

export default function SafeguardBelt({ coverage = 0, reduced }) {
  const r = 300
  const count = Math.max(8, Math.round((coverage / 100) * 64))
  const dots = new Array(count).fill(0).map((_, i) => {
    const a = (i / count) * Math.PI * 2
    return { x: VIEW.cx + Math.cos(a) * r, y: VIEW.cy + Math.sin(a) * r }
  })
  return (
    <motion.g
      animate={reduced ? undefined : { rotate: 360 }}
      transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      style={{ transformOrigin: `${VIEW.cx}px ${VIEW.cy}px` }}
      opacity={0.5}
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={1.4} fill="var(--champagne)" opacity={0.6} />
      ))}
    </motion.g>
  )
}
