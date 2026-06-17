/*
  OrbitRing.jsx
  A faint orbital path drawn progressively.
*/
import React from 'react'
import { motion } from 'framer-motion'

export default function OrbitRing({ cx, cy, r, tone = 'var(--line2)', reduced }) {
  if (reduced) {
    return <circle cx={cx} cy={cy} r={r} fill="none" stroke={tone} strokeWidth={1} />
  }
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke={tone}
      strokeWidth={1}
      strokeDasharray={2 * Math.PI * r}
      initial={{ strokeDashoffset: 2 * Math.PI * r }}
      animate={{ strokeDashoffset: 0 }}
      transition={{ duration: 1.1, ease: 'easeInOut' }}
    />
  )
}
