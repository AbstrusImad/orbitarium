/*
  Toast.jsx
  Minimal toast system with a context provider and a hook.
*/
import React, { createContext, useContext, useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, tone = 'sage') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3200)
  }, [])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-2 no-select">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.24 }}
              className="glass rounded-xl px-4 py-3 text-sm shadow-2xl"
              style={{ borderColor: `var(--${t.tone})` }}
            >
              <span style={{ color: `var(--${t.tone}-text, var(--bone))` }} className="mono text-xs uppercase tracking-wider mr-2">
                Orbitarium
              </span>
              <span className="text-bone2">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) return { push: () => {} }
  return ctx
}
