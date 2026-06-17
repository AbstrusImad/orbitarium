/*
  StabilityMotion.jsx
  A visual simulation. On Run, the system animates: heavy bodies pull, unchecked
  routes tremble, emergency powers cross as comets. At the end a compact result.
*/
import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ModeHeader from '../components/layout/ModeHeader.jsx'
import StabilitySimulator from '../components/animations/StabilitySimulator.jsx'
import AuthorityMeter from '../components/shared/AuthorityMeter.jsx'
import EmptyState from '../components/shared/EmptyState.jsx'
import { useStore } from '../state/store.jsx'
import { buildSimulationModel, runStabilityMotion } from '../utils/stabilityEngine.js'

const VERDICT_TONE = { Synchronized: 'var(--sage)', Wobbling: 'var(--champagne)', 'Breaking Orbit': 'var(--crimson)' }

export default function StabilityMotion() {
  const { draft } = useStore()
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)

  const model = useMemo(() => buildSimulationModel(draft), [draft])

  const run = () => {
    setResult(null)
    setRunning(true)
    setTimeout(() => {
      setResult(runStabilityMotion(draft))
      setRunning(false)
    }, 3200)
  }

  if (!draft.core || draft.roles.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <ModeHeader kicker="Stability Motion" title="Run the System" />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState title="No system in motion" hint="Build a core with roles and powers, then run the stability motion to watch it settle or break." />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <ModeHeader
        kicker="Stability Motion"
        title="Run Stability Motion"
        hint="Watch the orbits respond. Synchronized orbits mean a stable system; trembling routes and crossing comets mean instability."
        actions={
          <button
            onClick={run}
            disabled={running}
            className="rounded-lg px-4 py-2 text-xs font-medium"
            style={{ background: running ? 'var(--ink4)' : 'var(--sage)', color: running ? 'var(--ash)' : 'var(--sage-ink)' }}
          >
            {running ? 'Running...' : 'Run Stability Motion'}
          </button>
        }
      />
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0">
          <StabilitySimulator model={model} running />
        </div>

        {running && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 mono text-[11px] text-bone2"
          >
            settling orbits...
          </motion.div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 glass rounded-2xl px-5 py-4 w-[min(680px,calc(100%-2rem))]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="mono text-[10px] uppercase tracking-wider text-ash">Result</div>
                <span className="mono text-sm" style={{ color: VERDICT_TONE[result.verdict] }}>{result.verdict}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <AuthorityMeter label="Stability" value={result.authorityStability} size={70} />
                <AuthorityMeter label="Centralization" value={result.centralizationGravity} invert size={70} />
                <AuthorityMeter label="Community dist." value={result.communityDistance} invert size={70} />
                <AuthorityMeter label="Safeguards" value={result.safeguardCoverage} size={70} />
                <AuthorityMeter label="Emergency" value={result.emergencyRisk} invert size={70} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
