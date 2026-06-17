/*
  RadialActionMenu.jsx
  A small radial menu of actions that fans out around an anchor point.
*/
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function RadialActionMenu({ open, actions = [], onClose }) {
  const radius = 64
  const start = -Math.PI / 2
  const spread = Math.PI * 1.2
  const step = actions.length > 1 ? spread / (actions.length - 1) : 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute z-40"
          style={{ left: 0, top: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {actions.map((a, i) => {
            const angle = start + step * i
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            return (
              <motion.button
                key={a.key}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
                animate={{ x, y, opacity: 1, scale: 1 }}
                exit={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
                transition={{ delay: i * 0.03 }}
                onClick={(e) => {
                  e.stopPropagation()
                  a.onClick()
                  onClose && onClose()
                }}
                title={a.label}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center hairline mono text-[10px]"
                style={{ width: 38, height: 38, background: 'var(--ink3)', color: a.tone || 'var(--bone)' }}
              >
                {a.short}
              </motion.button>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
