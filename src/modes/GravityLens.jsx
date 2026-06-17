/*
  GravityLens.jsx
  A visual lens of power concentration. Space curves toward heavy roles,
  dangerous routes glow crimson, the community sits in a weak outer orbit.
  A minimal legend, no giant tables.
*/
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import ModeHeader from '../components/layout/ModeHeader.jsx'
import OrbitMap from '../components/orbit/OrbitMap.jsx'
import AuthorityMeter from '../components/shared/AuthorityMeter.jsx'
import CommunityDistanceMeter from '../components/shared/CommunityDistanceMeter.jsx'
import { useStore } from '../state/store.jsx'
import { calculateAuthorityGravity } from '../utils/gravityEngine.js'
import EmptyState from '../components/shared/EmptyState.jsx'

const LEGEND = [
  { tone: 'var(--crimson)', label: 'Risk and centralization' },
  { tone: 'var(--sage)', label: 'Stable authority' },
  { tone: 'var(--champagne)', label: 'Community and review' },
  { tone: 'var(--ember)', label: 'Neutral powers' }
]

export default function GravityLens() {
  const { draft } = useStore()
  const metrics = useMemo(() => calculateAuthorityGravity(draft), [draft])

  if (!draft.core || draft.roles.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <ModeHeader kicker="Gravity Lens" title="Power Concentration" />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState title="Nothing to bend yet" hint="Add a core and a few roles. The lens reveals how power curves the field." />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <ModeHeader
        kicker="Gravity Lens"
        title="Power Concentration"
        hint="High-power zones curve space. Powerful roles carry more mass. Dangerous routes turn crimson; strong constraints stabilize the field."
      />
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_300px]">
        <div className="relative min-h-0">
          <OrbitMap system={draft} showGravity showBelt metrics={metrics} interactive selected={null} onSelect={() => {}} />
          {/* Legend */}
          <div className="absolute bottom-4 left-4 glass rounded-xl p-3">
            <div className="mono text-[9px] uppercase tracking-wider text-ash mb-2">Legend</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {LEGEND.map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <span className="rounded-full" style={{ width: 8, height: 8, background: l.tone, boxShadow: `0 0 6px ${l.tone}` }} />
                  <span className="text-[11px] text-bone2">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side readouts */}
        <div className="border-l p-4 overflow-auto space-y-5" style={{ borderColor: 'var(--line1)' }}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
            <AuthorityMeter label="Centralization gravity" value={metrics.centralizationGravity} invert sub="grav" size={84} />
            <AuthorityMeter label="Safeguard coverage" value={metrics.safeguardCoverage} sub="cover" size={84} />
            <AuthorityMeter label="Emergency risk" value={metrics.emergencyRisk} invert sub="risk" size={84} />
            <AuthorityMeter label="Authority stability" value={metrics.authorityStability} sub="stab" size={84} />
          </motion.div>
          <CommunityDistanceMeter value={metrics.communityDistance} />

          {metrics.overloadedRoles.length > 0 && (
            <div className="rounded-xl p-3 hairline" style={{ background: 'var(--crimson-glow)', borderColor: 'var(--crimson)' }}>
              <div className="mono text-[10px] uppercase tracking-wider text-crimson mb-1.5">Overloaded roles</div>
              <div className="flex flex-wrap gap-1.5">
                {metrics.overloadedRoles.map((r) => (
                  <span key={r} className="rounded-full px-2 py-0.5 text-[11px] text-bone hairline">{r}</span>
                ))}
              </div>
            </div>
          )}

          {metrics.uncheckedPowers.length > 0 && (
            <div className="rounded-xl p-3 hairline" style={{ background: 'var(--ink1)' }}>
              <div className="mono text-[10px] uppercase tracking-wider text-ash mb-1.5">Unchecked authority paths</div>
              <div className="flex flex-wrap gap-1.5">
                {metrics.uncheckedPowers.map((p) => (
                  <span key={p} className="rounded-full px-2 py-0.5 text-[11px] text-bone2 hairline">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
