/*
  VaultCapsule.jsx
  A saved system shown as an orbital capsule / mini galaxy, not a table row.
*/
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { calculateAuthorityGravity } from '../../utils/gravityEngine.js'

const TONE = { crimson: 'var(--crimson)', ember: 'var(--ember)', sage: 'var(--sage)', champagne: 'var(--champagne)' }

function MiniGalaxy({ system }) {
  const roles = system.roles || []
  return (
    <svg width="100%" height="120" viewBox="0 0 220 120" className="block">
      {roles.map((r, i) => {
        const radius = 16 + (r.orbitDistance || 40) * 0.42
        return <circle key={`o${r.id || i}`} cx="110" cy="60" r={radius} fill="none" stroke="var(--line1)" />
      })}
      {roles.map((r, i) => {
        const radius = 16 + (r.orbitDistance || 40) * 0.42
        const a = -Math.PI / 2 + i * ((Math.PI * 2) / Math.max(1, roles.length))
        const x = 110 + Math.cos(a) * radius
        const y = 60 + Math.sin(a) * radius
        const color = TONE[r.tone] || TONE.sage
        const size = 2.5 + (r.authorityWeight || 40) * 0.05
        return <circle key={`b${r.id || i}`} cx={x} cy={y} r={size} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      })}
      <circle cx="110" cy="60" r="4" fill="var(--bone)" />
    </svg>
  )
}

export default function VaultCapsule({ system, onOpen, onDuplicate, onDelete, onExport }) {
  const metrics = useMemo(() => calculateAuthorityGravity(system), [system])
  const stabTone = metrics.authorityStability >= 60 ? 'var(--sage)' : metrics.authorityStability >= 40 ? 'var(--champagne)' : 'var(--crimson)'
  const riskTone = metrics.emergencyRisk >= 60 ? 'var(--crimson)' : metrics.emergencyRisk >= 35 ? 'var(--ember)' : 'var(--sage)'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl overflow-hidden hairline"
      style={{ background: 'var(--ink1)' }}
    >
      <div className="relative" style={{ background: 'radial-gradient(120px 80px at 50% 50%, var(--sage-glow), transparent)' }}>
        <MiniGalaxy system={system} />
        <span className="absolute top-2 right-2 rounded-full px-2 py-0.5 mono text-[9px]" style={{ background: 'var(--ink2)', color: riskTone, border: `1px solid ${riskTone}` }}>
          risk {metrics.emergencyRisk}
        </span>
      </div>
      <div className="p-3.5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm text-bone leading-tight truncate">{system.protocolName}</h4>
          <span className="mono text-sm tabular" style={{ color: stabTone }}>{metrics.authorityStability}</span>
        </div>
        <div className="mono text-[10px] text-ash mt-1">
          {system.roles?.length || 0} roles : {system.powers?.length || 0} powers : {system.constraints?.length || 0} guards
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <button onClick={onOpen} className="flex-1 rounded-lg py-1.5 text-[11px] font-medium" style={{ background: 'var(--sage)', color: 'var(--sage-ink)' }}>
            Open
          </button>
          <button onClick={onDuplicate} className="rounded-lg px-2.5 py-1.5 text-[11px] hairline text-bone2" title="Duplicate">Dup</button>
          <button onClick={onExport} className="rounded-lg px-2.5 py-1.5 text-[11px] hairline text-bone2" title="Export JSON">Exp</button>
          <button onClick={onDelete} className="rounded-lg px-2.5 py-1.5 text-[11px] hairline text-crimson" title="Delete">Del</button>
        </div>
      </div>
    </motion.div>
  )
}
