/*
  VoidEntry.jsx
  The opening void. Not a landing page: a core in space, a single line of
  copy and two quiet actions.
*/
import React from 'react'
import { motion } from 'framer-motion'
import Starfield from '../components/animations/Starfield.jsx'
import VoidEntryCore from '../components/shared/VoidEntryCore.jsx'
import { useStore } from '../state/store.jsx'
import { ARCDAO_SYSTEM } from '../data/demoSystems.js'
import { shortId } from '../utils/formatters.js'

export default function VoidEntry({ onEnter }) {
  const { resetDraft, setDraft } = useStore()

  const createCore = () => {
    resetDraft()
    onEnter('canvas', { intent: 'create-core' })
  }

  const openDemo = () => {
    const demo = JSON.parse(JSON.stringify(ARCDAO_SYSTEM))
    demo.systemId = shortId('sys')
    demo.protocolName = ARCDAO_SYSTEM.protocolName
    setDraft(demo)
    onEnter('canvas', { intent: 'demo' })
  }

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: 'var(--ink0)' }}>
      <Starfield density={0.0001} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(900px 600px at 50% 45%, var(--sage-glow), transparent 65%)' }}
      />
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
          <VoidEntryCore />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9 }}
          className="text-center -mt-4"
        >
          <h1 className="font-head text-3xl sm:text-4xl tracking-tight text-bone">Map the gravity of power.</h1>
          <p className="mt-3 text-sm text-ash max-w-md mx-auto leading-relaxed">
            Design authority as an orbital system. Make hidden power visible: see who can move what, when, and how.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-9 flex flex-col sm:flex-row items-center gap-3"
        >
          <button
            onClick={createCore}
            className="rounded-xl px-6 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5"
            style={{ background: 'var(--sage)', color: 'var(--sage-ink)', boxShadow: '0 8px 30px var(--sage-glow)' }}
          >
            Create Authority Core
          </button>
          <button onClick={openDemo} className="rounded-xl px-5 py-3 text-sm text-bone2 hover:text-bone mono">
            Open Demo System
          </button>
        </motion.div>

        <div className="absolute bottom-6 mono text-[10px] uppercase tracking-[0.25em] text-mute">
          Orbitarium : authority cartographer
        </div>
      </div>
    </div>
  )
}
