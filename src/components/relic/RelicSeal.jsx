/*
  RelicSeal.jsx
  Renders the Authority Relic as a sealed object: a sigil, a mini orbital map
  and the headline figures. Not a plain card.
*/
import React from 'react'
import { motion } from 'framer-motion'
import OrbitMap from '../orbit/OrbitMap.jsx'
import GenLayerProofBadge from '../shared/GenLayerProofBadge.jsx'
import { calculateAuthorityGravity } from '../../utils/gravityEngine.js'

function Sigil({ seal }) {
  return (
    <div className="relative" style={{ width: 64, height: 64 }}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="30" fill="none" stroke="var(--sage)" strokeWidth="1.2" />
        <circle cx="32" cy="32" r="24" fill="none" stroke="var(--line3)" strokeDasharray="2 3" />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2
          return <circle key={i} cx={32 + Math.cos(a) * 24} cy={32 + Math.sin(a) * 24} r="1.6" fill="var(--champagne)" />
        })}
        <circle cx="32" cy="32" r="7" fill="var(--sage)" opacity="0.4" />
        <circle cx="32" cy="32" r="3" fill="var(--bone)" />
      </svg>
    </div>
  )
}

export default function RelicSeal({ relic, system }) {
  const metrics = relic.metrics
  const mapSystem = system || {
    core: relic.miniMap.core,
    protocolName: relic.protocolName,
    roles: relic.miniMap.roles.map((r) => ({ ...r, key: r.key || 'role' })),
    powers: relic.miniMap.powers,
    constraints: system?.constraints || []
  }
  const mapMetrics = calculateAuthorityGravity(mapSystem)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, rotateX: 8 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="rounded-3xl overflow-hidden hairline"
      style={{ background: 'linear-gradient(160deg, var(--ink2), var(--ink1))', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}
    >
      <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--line2)' }}>
        <div className="flex items-center gap-4">
          <Sigil seal={relic.seal} />
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.2em] text-sagetext">Authority Relic</div>
            <h3 className="font-head text-xl text-bone leading-tight">{relic.protocolName}</h3>
            <div className="mono text-[10px] text-ash mt-1 truncate max-w-[260px]">seal {relic.seal}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-[10px] uppercase text-ash">stability</div>
          <div className="font-head text-3xl tabular" style={{ color: metrics.authorityStability >= 60 ? 'var(--sage)' : 'var(--crimson)' }}>
            {metrics.authorityStability}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px]">
        <div className="relative h-[300px] border-b md:border-b-0 md:border-r" style={{ borderColor: 'var(--line2)' }}>
          <OrbitMap system={mapSystem} metrics={mapMetrics} interactive={false} showBelt selected={null} onSelect={() => {}} />
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 mono text-[11px]">
            <Metric label="Centralization" value={metrics.centralizationGravity} tone="var(--crimson)" />
            <Metric label="Community dist." value={metrics.communityDistance} tone="var(--champagne)" />
            <Metric label="Safeguards" value={metrics.safeguardCoverage} tone="var(--sage)" />
            <Metric label="Emergency risk" value={metrics.emergencyRisk} tone="var(--crimson)" />
          </div>

          <Section title="Main roles" items={relic.mainRoles} />
          <Section title="Critical powers" items={relic.criticalPowers} tone="var(--crimson)" />
          <Section title="Constraints" items={relic.constraints} tone="var(--champagne)" />

          {relic.topIssue && (
            <div className="rounded-xl p-3 hairline" style={{ background: 'var(--crimson-glow)', borderColor: 'var(--crimson)' }}>
              <div className="mono text-[10px] uppercase text-crimson mb-1">Main issue</div>
              <div className="text-sm text-bone">{relic.topIssue.name}</div>
              <p className="text-[11px] text-bone2 mt-1 leading-snug">{relic.topIssue.reason}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 border-t" style={{ borderColor: 'var(--line2)' }}>
        <GenLayerProofBadge proof={relic.mockProof} compact />
      </div>
    </motion.div>
  )
}

function Metric({ label, value, tone }) {
  return (
    <div className="rounded-lg px-2.5 py-2 hairline" style={{ background: 'var(--ink1)' }}>
      <div className="text-ash">{label}</div>
      <div className="tabular text-sm" style={{ color: tone }}>{value}</div>
    </div>
  )
}

function Section({ title, items, tone = 'var(--bone2)' }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <div className="mono text-[10px] uppercase tracking-wider text-ash mb-1.5">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span key={it} className="rounded-full px-2 py-0.5 text-[11px] hairline" style={{ color: tone }}>
            {it}
          </span>
        ))}
      </div>
    </div>
  )
}
