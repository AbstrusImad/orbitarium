/*
  FloatingInspector.jsx
  A floating contextual panel that animates in when a body is selected.
*/
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function FloatingInspector({ open, title, kicker, onClose, children, side = 'right' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ opacity: 0, x: side === 'right' ? 24 : -24, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: side === 'right' ? 24 : -24, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 240, damping: 26 }}
          className={`absolute top-4 ${side === 'right' ? 'right-4' : 'left-4'} z-30 w-[320px] max-h-[calc(100%-2rem)] overflow-auto glass rounded-2xl p-4 shadow-2xl`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              {kicker && <div className="mono text-[10px] uppercase tracking-[0.18em] text-sagetext mb-1">{kicker}</div>}
              <h3 className="text-base text-bone leading-tight">{title}</h3>
            </div>
            <button onClick={onClose} className="text-ash hover:text-bone text-lg leading-none px-1" aria-label="Close">
              x
            </button>
          </div>
          {children}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
