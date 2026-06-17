/*
  VoidEntry.jsx
  The opening void. Not a landing page: a living orbital core where the real
  authority maps notarized on GenLayer orbit the star, a single line of copy,
  a live notarization count, and quiet actions.
*/
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import Starfield from '../components/animations/Starfield.jsx'
import VoidEntryCore from '../components/shared/VoidEntryCore.jsx'
import { useStore } from '../state/store.jsx'
import { ARCDAO_SYSTEM } from '../data/demoSystems.js'
import { shortId } from '../utils/formatters.js'

// Risk class to accent token. Distributed reads safe, centralized reads risk.
const RISK_ACCENT = {
  Distributed: 'sage',
  Balanced: 'champagne',
  Concentrated: 'ember',
  Centralized: 'crimson',
  Critical: 'crimson'
}

export default function VoidEntry({ onEnter }) {
  const { resetDraft, setDraft, chainRelics, settings } = useStore()
  const reduced = settings?.reducedMotion

  const relics = useMemo(() => (Array.isArray(chainRelics) ? chainRelics.slice(0, 6) : []), [chainRelics])
  const liveCount = relics.length

  const createCore = () => {
    resetDraft()
    onEnter('canvas', { intent: 'create-core' })
  }

  const openSample = () => {
    const sample = JSON.parse(JSON.stringify(ARCDAO_SYSTEM))
    sample.systemId = shortId('sys')
    sample.protocolName = ARCDAO_SYSTEM.protocolName
    setDraft(sample)
    onEnter('canvas', { intent: 'sample' })
  }

  // Orbit layout: place each notarized relic on a ring around the core. The
  // whole group rotates slowly so the maps drift like planets. When no relics
  // have loaded yet, a few faint neutral bodies keep the void from feeling bare.
  const ringRadius = 168
  const bodies = liveCount > 0 ? relics : [null, null, null, null]
  const n = bodies.length

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: 'var(--ink0)' }}>
      <Starfield density={0.00014} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(1000px 680px at 50% 44%, var(--sage-glow), transparent 66%)' }}
      />

      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6">
        {/* Living orbital system: the core with the real notarized maps orbiting it. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
          style={{ width: 2 * ringRadius + 64, height: 2 * ringRadius + 64 }}
        >
          {/* orbit rings */}
          <div className="absolute rounded-full" style={{ inset: 0, border: '1px solid var(--line2)' }} />
          <div className="absolute rounded-full" style={{ inset: 64, border: '1px solid var(--line1)' }} />

          {/* core */}
          <div className="absolute inset-0 flex items-center justify-center">
            <VoidEntryCore />
          </div>

          {/* orbiting maps */}
          <motion.div
            className="absolute inset-0"
            animate={reduced ? {} : { rotate: 360 }}
            transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
          >
            {bodies.map((r, i) => {
              const angle = (360 / n) * i
              const accent = r ? `var(--${RISK_ACCENT[r.riskClass] || 'ember'})` : 'var(--mute)'
              const gravity = r ? (r.metrics?.centralizationGravity ?? 0) : 0
              const size = r ? 14 + Math.round((gravity / 100) * 16) : 9
              return (
                <div
                  key={r ? r.id : `placeholder-${i}`}
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: `rotate(${angle}deg) translateY(-${ringRadius}px)`, marginLeft: -size / 2, marginTop: -size / 2 }}
                >
                  {r ? (
                    <button
                      type="button"
                      onClick={() => onEnter('vault', { focus: r.id })}
                      title={`${r.protocolName} : ${r.riskClass} (gravity ${gravity})`}
                      className="block rounded-full"
                      style={{
                        width: size,
                        height: size,
                        background: accent,
                        boxShadow: `0 0 16px ${accent}`,
                        border: '1px solid var(--ink0)',
                        cursor: 'pointer'
                      }}
                    />
                  ) : (
                    <span
                      className="block rounded-full"
                      style={{ width: size, height: size, background: 'var(--mute)', opacity: 0.5 }}
                    />
                  )}
                </div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* copy */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.9 }}
          className="text-center -mt-2"
        >
          <h1 className="font-head text-3xl sm:text-4xl tracking-tight text-bone">Map the gravity of power.</h1>
          <p className="mt-3 text-sm text-ash max-w-md mx-auto leading-relaxed">
            Design authority as an orbital system. Make hidden power visible: see who can move what, when, and how.
          </p>

          {/* live notarization count, real on-chain data */}
          <button
            type="button"
            onClick={() => liveCount > 0 && onEnter('vault', {})}
            className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 mono text-[11px] hairline"
            style={{ background: 'var(--ink2)', color: 'var(--bone2)', cursor: liveCount > 0 ? 'pointer' : 'default' }}
          >
            <motion.span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--sage)' }}
              animate={reduced ? {} : { opacity: [1, 0.3, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {liveCount > 0
              ? `${liveCount} authority ${liveCount === 1 ? 'map' : 'maps'} notarized on GenLayer Bradbury`
              : 'Notarized on GenLayer Bradbury'}
          </button>
        </motion.div>

        {/* actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.8 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3"
        >
          <button
            onClick={createCore}
            className="rounded-xl px-6 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5"
            style={{ background: 'var(--sage)', color: 'var(--sage-ink)', boxShadow: '0 8px 30px var(--sage-glow)' }}
          >
            Create Authority Core
          </button>
          <button onClick={openSample} className="rounded-xl px-5 py-3 text-sm text-bone2 hover:text-bone mono">
            Explore a Sample Map
          </button>
          {liveCount > 0 ? (
            <button
              onClick={() => onEnter('vault', {})}
              className="rounded-xl px-5 py-3 text-sm text-bone2 hover:text-bone mono"
            >
              Browse Notarized Maps
            </button>
          ) : null}
        </motion.div>

        <div className="absolute bottom-6 mono text-[10px] uppercase tracking-[0.25em] text-mute">
          Orbitarium : authority cartographer
        </div>
      </div>
    </div>
  )
}
