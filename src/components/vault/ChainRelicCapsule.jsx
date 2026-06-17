/*
  ChainRelicCapsule.jsx
  A relic notarized on the GenLayer Bradbury contract, shown as a verified
  capsule in the Vault. Distinct from local systems: it carries a quiet
  "Verified on GenLayer" seal, the authoritative risk class and the five
  gravity metrics, and an explorer link to the contract. Read-only.
*/
import React from 'react'
import { motion } from 'framer-motion'

const RISK_TONE = {
  Distributed: 'var(--sage)',
  Balanced: 'var(--sage)',
  Concentrated: 'var(--champagne)',
  Centralized: 'var(--ember)',
  Critical: 'var(--crimson)'
}

function MiniGauge({ label, value, invert }) {
  const v = invert ? 100 - (value || 0) : value || 0
  const tone = v >= 66 ? 'var(--sage)' : v >= 40 ? 'var(--champagne)' : 'var(--crimson)'
  return (
    <div className="rounded-lg px-2 py-1.5 hairline" style={{ background: 'var(--ink2)' }}>
      <div className="text-[9px] text-ash leading-none">{label}</div>
      <div className="mono text-sm tabular" style={{ color: tone }}>{value}</div>
    </div>
  )
}

export default function ChainRelicCapsule({ relic }) {
  const m = relic.metrics || {}
  const tone = RISK_TONE[relic.riskClass] || 'var(--champagne)'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl overflow-hidden hairline"
      style={{ background: 'var(--ink1)', borderColor: 'var(--sage)' }}
    >
      <div className="relative p-3.5" style={{ background: 'radial-gradient(140px 90px at 50% 0%, var(--sage-glow), transparent)' }}>
        <div className="flex items-center justify-between gap-2">
          <span className="mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: 'var(--sage)', border: '1px solid var(--sage)' }}>
            Verified on GenLayer
          </span>
          <span className="mono text-[9px] uppercase px-2 py-0.5 rounded-full" style={{ color: tone, border: `1px solid ${tone}` }}>
            {relic.riskClass}
          </span>
        </div>
        <h4 className="text-sm text-bone leading-tight truncate mt-2.5">{relic.protocolName}</h4>
        {relic.summary && <p className="text-[11px] text-bone2 mt-1 leading-snug line-clamp-2">{relic.summary}</p>}
      </div>

      <div className="px-3.5 pb-3.5">
        <div className="grid grid-cols-3 gap-1.5">
          <MiniGauge label="Central." value={m.centralizationGravity} invert />
          <MiniGauge label="Stability" value={m.authorityStability} />
          <MiniGauge label="Emergency" value={m.emergencyRisk} invert />
          <MiniGauge label="Comm. dist." value={m.communityDistance} invert />
          <MiniGauge label="Safeguards" value={m.safeguardCoverage} />
          <div className="rounded-lg px-2 py-1.5 hairline flex items-center justify-center" style={{ background: 'var(--ink2)' }}>
            <span className="mono text-[9px] text-ash uppercase">{(relic.issues || []).length} issues</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="mono text-[10px] text-ash truncate max-w-[140px]">{relic.onChainId}</span>
          <a
            href={relic.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-2.5 py-1.5 text-[10px] hairline text-bone2"
            style={{ background: 'var(--ink2)' }}
          >
            Explorer
          </a>
        </div>
      </div>
    </motion.div>
  )
}
