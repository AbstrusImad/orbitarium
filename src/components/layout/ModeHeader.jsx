/*
  ModeHeader.jsx
  A consistent header for each instrument mode: kicker, title, optional actions.
*/
import React from 'react'
import { motion } from 'framer-motion'

export default function ModeHeader({ kicker, title, hint, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {kicker && <div className="mono text-[10px] uppercase tracking-[0.22em] text-sagetext mb-1">{kicker}</div>}
        <h2 className="font-head text-xl text-bone leading-none">{title}</h2>
        {hint && <p className="text-xs text-ash mt-2 max-w-xl leading-relaxed">{hint}</p>}
      </motion.div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
