/*
  PowerBodies.jsx
  An orbital catalog of roles and powers, rendered as bodies (not a list or
  checkboxes). Selecting a body adds it to the working system.
*/
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ModeHeader from '../components/layout/ModeHeader.jsx'
import RiskBadge from '../components/shared/RiskBadge.jsx'
import { ROLE_LIBRARY } from '../data/roleLibrary.js'
import { POWER_LIBRARY } from '../data/powerLibrary.js'
import { useStore } from '../state/store.jsx'
import { addRole, addPower, ensureId, createCore } from '../state/draftOps.js'
import { useToast } from '../components/shared/Toast.jsx'

const TONE = { crimson: 'var(--crimson)', ember: 'var(--ember)', sage: 'var(--sage)', champagne: 'var(--champagne)' }

function RoleBody({ role, onAdd }) {
  const color = TONE[role.tone] || TONE.sage
  const size = 46 + role.authorityWeight * 0.28
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -3 }}
      onClick={onAdd}
      className="group relative flex flex-col items-center justify-center rounded-2xl p-4 hairline text-center"
      style={{ background: 'var(--ink1)' }}
    >
      <div className="relative mb-3" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-full" style={{ background: color, opacity: 0.16 }} />
        <div
          className="absolute rounded-full"
          style={{ inset: size * 0.18, background: color, boxShadow: `0 0 18px ${color}` }}
        />
        <div className="absolute rounded-full" style={{ width: size * 0.2, height: size * 0.2, top: size * 0.24, left: size * 0.24, background: 'var(--bone)', opacity: 0.4 }} />
      </div>
      <div className="text-sm text-bone leading-tight">{role.name}</div>
      <div className="mono text-[9px] text-ash mt-1 uppercase tracking-wider">{role.visibility}</div>
      <div className="mono text-[10px] mt-1.5" style={{ color }}>mass {role.authorityWeight}</div>
      <p className="text-[11px] text-mute mt-2 leading-snug opacity-0 group-hover:opacity-100 transition-opacity">{role.hint}</p>
    </motion.button>
  )
}

function PowerBody({ power, onAdd }) {
  const color = power.riskLevel === 'emergency' ? TONE.crimson : power.riskLevel === 'sensitive' ? TONE.ember : TONE.sage
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -3 }}
      onClick={onAdd}
      className="group relative flex flex-col items-start rounded-2xl p-4 hairline text-left"
      style={{ background: 'var(--ink1)' }}
    >
      <div className="flex items-center justify-between w-full mb-3">
        <div className="relative" style={{ width: 30, height: 30 }}>
          <div className="absolute rounded-full" style={{ inset: 8, background: color, boxShadow: `0 0 12px ${color}` }} />
          <svg width="30" height="30" viewBox="0 0 30 30" className="absolute inset-0">
            <path d="M3 22 L15 15" stroke={color} strokeWidth="1.4" fill="none" opacity="0.7" />
          </svg>
        </div>
        <RiskBadge level={power.riskLevel} small />
      </div>
      <div className="text-sm text-bone leading-tight">{power.name}</div>
      <div className="flex flex-wrap gap-1 mt-2 mono text-[9px] text-ash">
        <span className="rounded px-1.5 py-0.5 hairline">{power.scope}</span>
        <span className="rounded px-1.5 py-0.5 hairline">{power.reversibility}</span>
        {power.treasury && <span className="rounded px-1.5 py-0.5 hairline" style={{ color: 'var(--crimson)' }}>treasury</span>}
      </div>
      <p className="text-[11px] text-mute mt-2 leading-snug opacity-0 group-hover:opacity-100 transition-opacity">{power.hint}</p>
    </motion.button>
  )
}

export default function PowerBodies() {
  const { draft, setDraft } = useStore()
  const { push } = useToast()
  const [tab, setTab] = useState('roles')

  const ensureCore = (d) => (d.core ? d : createCore(ensureId(d), d.protocolName || 'New Protocol'))

  return (
    <div className="h-full flex flex-col">
      <ModeHeader
        kicker="Power Bodies"
        title="Orbital Catalog"
        hint="Add roles as planets and powers as comets. Each body carries authority weight, scope, risk, visibility and reversibility."
        actions={
          <div className="flex rounded-lg hairline overflow-hidden">
            {['roles', 'powers'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-2 text-xs capitalize"
                style={{ background: tab === t ? 'var(--ink4)' : 'transparent', color: tab === t ? 'var(--bone)' : 'var(--ash)' }}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />
      <div className="flex-1 overflow-auto px-6 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {tab === 'roles'
            ? ROLE_LIBRARY.map((r) => (
                <RoleBody
                  key={r.key}
                  role={r}
                  onAdd={() => {
                    setDraft((d) => addRole(ensureCore(d), r.key))
                    push(`${r.name} added to orbit`, 'champagne')
                  }}
                />
              ))
            : POWER_LIBRARY.map((p) => (
                <PowerBody
                  key={p.key}
                  power={p}
                  onAdd={() => {
                    setDraft((d) => addPower(ensureCore(d), p.key))
                    push(`${p.name} added`, 'champagne')
                  }}
                />
              ))}
        </div>
      </div>
    </div>
  )
}
