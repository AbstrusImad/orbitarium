/*
  OrbitCanvas.jsx
  The main building experience. Create the core, place roles as bodies, assign
  powers as routes, drag bodies to change orbit, inspect and edit, then save.
*/
import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModeHeader from '../components/layout/ModeHeader.jsx'
import OrbitMap from '../components/orbit/OrbitMap.jsx'
import FloatingInspector from '../components/orbit/FloatingInspector.jsx'
import WeightDial from '../components/shared/WeightDial.jsx'
import RiskBadge from '../components/shared/RiskBadge.jsx'
import { useStore } from '../state/store.jsx'
import { calculateAuthorityGravity } from '../utils/gravityEngine.js'
import { ROLE_LIBRARY } from '../data/roleLibrary.js'
import { POWER_LIBRARY } from '../data/powerLibrary.js'
import { useToast } from '../components/shared/Toast.jsx'
import {
  createCore,
  addRole,
  addPower,
  updateRole,
  updatePower,
  togglePowerAssignment,
  removeRole,
  removePower,
  ensureId
} from '../state/draftOps.js'

function QuickAdd({ open, items, onPick, onClose, title }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="absolute bottom-16 left-4 z-40 w-64 max-h-72 overflow-auto glass rounded-xl p-2"
        >
          <div className="mono text-[10px] uppercase tracking-wider text-ash px-2 py-1.5">{title}</div>
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => {
                onPick(it.key)
                onClose()
              }}
              className="w-full text-left rounded-lg px-2 py-1.5 text-sm text-bone2 hover:text-bone hover:bg-[var(--ink3)] flex items-center justify-between"
            >
              <span>{it.name}</span>
              <span className="mono text-[9px] text-ash">{it.riskLevel || it.visibility || ''}</span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function OrbitCanvas() {
  const { draft, setDraft, saveSystem } = useStore()
  const { push } = useToast()
  const [selected, setSelected] = useState(null)
  const [menu, setMenu] = useState(null) // 'role' | 'power'
  const [coreName, setCoreName] = useState(draft.protocolName || '')

  const metrics = useMemo(() => calculateAuthorityGravity(draft), [draft])
  const hasCore = !!draft.core

  const selectedRole = selected?.type === 'role' ? draft.roles.find((r) => r.id === selected.id) : null
  const selectedPower = selected?.type === 'power' ? draft.powers.find((p) => p.id === selected.id) : null

  const mutate = (fn) => setDraft((d) => fn(d))

  const handleCreateCore = () => {
    const name = coreName.trim() || 'New Protocol'
    mutate((d) => createCore(ensureId(d), name))
    push('Protocol core created', 'sage')
  }

  const handleSave = () => {
    const saved = saveSystem(ensureId(draft))
    setDraft(saved)
    push('System saved to vault', 'sage')
  }

  const dragRole = (roleId, { orbitDistance, angle }) => {
    mutate((d) => updateRole(d, roleId, { orbitDistance, angle }))
  }

  if (!hasCore) {
    return (
      <div className="h-full flex flex-col">
        <ModeHeader kicker="Orbit Canvas" title="Create the Authority Core" hint="Name the protocol. Its core becomes the central star that every role orbits." />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 w-[420px] text-center"
          >
            <div className="mx-auto mb-5 rounded-full" style={{ width: 56, height: 56, background: 'radial-gradient(circle, var(--bone), var(--sage) 60%, transparent)' }} />
            <label className="block text-xs text-ash mb-2 mono uppercase tracking-wider">Protocol name</label>
            <input
              value={coreName}
              onChange={(e) => setCoreName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCore()}
              placeholder="e.g. ArcDAO"
              className="w-full rounded-lg px-3 py-2.5 text-center text-bone bg-[var(--ink1)] hairline outline-none focus:border-[var(--sage)]"
            />
            <button
              onClick={handleCreateCore}
              className="mt-4 w-full rounded-lg py-2.5 text-sm font-medium"
              style={{ background: 'var(--sage)', color: 'var(--sage-ink)' }}
            >
              Create Authority Core
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <ModeHeader
        kicker="Orbit Canvas"
        title={draft.protocolName || 'Authority System'}
        hint="Drag bodies to change orbit. Click a body to inspect and edit. Build routes by assigning powers to roles."
        actions={
          <>
            <div className="hidden md:flex items-center gap-3 mr-2 mono text-[11px]">
              <span className="text-ash">stability</span>
              <span className="tabular" style={{ color: metrics.authorityStability >= 60 ? 'var(--sage)' : 'var(--crimson)' }}>
                {metrics.authorityStability}
              </span>
            </div>
            <button onClick={handleSave} className="rounded-lg px-4 py-2 text-xs font-medium" style={{ background: 'var(--sage)', color: 'var(--sage-ink)' }}>
              Save System
            </button>
          </>
        }
      />

      <div className="relative flex-1 min-h-0">
        <OrbitMap
          system={draft}
          selected={selected}
          onSelect={(type, id) => setSelected(type ? { type, id } : null)}
          onDragRole={dragRole}
          metrics={metrics}
        />

        {/* Quick add toolbar */}
        <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2">
          <button
            onClick={() => setMenu(menu === 'role' ? null : 'role')}
            className="rounded-lg px-3 py-2 text-xs hairline text-bone2 glass"
          >
            Add Role
          </button>
          <button
            onClick={() => setMenu(menu === 'power' ? null : 'power')}
            className="rounded-lg px-3 py-2 text-xs hairline text-bone2 glass"
          >
            Add Power
          </button>
          <span className="mono text-[10px] text-mute ml-1">
            {draft.roles.length} roles : {draft.powers.length} powers : {draft.constraints.length} constraints
          </span>
        </div>

        <QuickAdd
          open={menu === 'role'}
          title="Orbital catalog : roles"
          items={ROLE_LIBRARY}
          onPick={(key) => {
            mutate((d) => addRole(d, key))
            push('Role added to orbit', 'champagne')
          }}
          onClose={() => setMenu(null)}
        />
        <QuickAdd
          open={menu === 'power'}
          title="Authority routes : powers"
          items={POWER_LIBRARY}
          onPick={(key) => {
            mutate((d) => addPower(d, key))
            push('Power added', 'champagne')
          }}
          onClose={() => setMenu(null)}
        />

        {/* Inspector: core */}
        <FloatingInspector
          open={selected?.type === 'core'}
          kicker="Protocol Core"
          title={draft.protocolName || 'Core'}
          onClose={() => setSelected(null)}
        >
          <label className="block text-xs text-ash mb-1.5 mono uppercase">Protocol name</label>
          <input
            value={draft.protocolName}
            onChange={(e) => mutate((d) => ({ ...d, protocolName: e.target.value, core: { ...d.core, name: e.target.value } }))}
            className="w-full rounded-lg px-3 py-2 text-bone bg-[var(--ink1)] hairline outline-none focus:border-[var(--sage)]"
          />
          <div className="mt-4 grid grid-cols-2 gap-2 mono text-[11px]">
            <Stat label="roles" value={draft.roles.length} />
            <Stat label="powers" value={draft.powers.length} />
            <Stat label="constraints" value={draft.constraints.length} />
            <Stat label="stability" value={metrics.authorityStability} />
          </div>
        </FloatingInspector>

        {/* Inspector: role */}
        <FloatingInspector
          open={!!selectedRole}
          kicker="Authority Body"
          title={selectedRole?.name || ''}
          onClose={() => setSelected(null)}
        >
          {selectedRole && (
            <div className="space-y-4">
              <WeightDial
                label="Authority weight"
                value={selectedRole.authorityWeight}
                onChange={(v) => mutate((d) => updateRole(d, selectedRole.id, { authorityWeight: v }))}
                tone={selectedRole.tone === 'crimson' ? 'var(--crimson)' : 'var(--sage)'}
              />
              <WeightDial
                label="Orbit distance"
                value={selectedRole.orbitDistance}
                onChange={(v) => mutate((d) => updateRole(d, selectedRole.id, { orbitDistance: v }))}
                tone="var(--champagne)"
              />
              <div>
                <label className="block text-xs text-ash mb-1.5 mono uppercase">Visibility</label>
                <div className="flex gap-1.5">
                  {['public', 'restricted', 'internal'].map((v) => (
                    <button
                      key={v}
                      onClick={() => mutate((d) => updateRole(d, selectedRole.id, { visibility: v }))}
                      className="flex-1 rounded-lg py-1.5 text-[11px] hairline"
                      style={{
                        background: selectedRole.visibility === v ? 'var(--ink4)' : 'transparent',
                        color: selectedRole.visibility === v ? 'var(--bone)' : 'var(--ash)'
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-ash mb-1.5 mono uppercase">Holds powers</label>
                <div className="space-y-1">
                  {draft.powers.length === 0 && <p className="text-xs text-mute">No powers yet. Add powers, then assign them here.</p>}
                  {draft.powers.map((p) => {
                    const has = (p.assignedTo || []).includes(selectedRole.id)
                    return (
                      <button
                        key={p.id}
                        onClick={() => mutate((d) => togglePowerAssignment(d, p.id, selectedRole.id))}
                        className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs hairline"
                        style={{ background: has ? 'var(--ink4)' : 'transparent', color: has ? 'var(--bone)' : 'var(--ash)' }}
                      >
                        <span>{p.name}</span>
                        <RiskBadge level={p.riskLevel} small />
                      </button>
                    )
                  })}
                </div>
              </div>
              <button
                onClick={() => {
                  mutate((d) => removeRole(d, selectedRole.id))
                  setSelected(null)
                  push('Role removed', 'ember')
                }}
                className="w-full rounded-lg py-2 text-xs text-crimson hairline"
              >
                Remove role
              </button>
            </div>
          )}
        </FloatingInspector>

        {/* Inspector: power */}
        <FloatingInspector
          open={!!selectedPower}
          kicker="Authority Route"
          title={selectedPower?.name || ''}
          onClose={() => setSelected(null)}
        >
          {selectedPower && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-ash mb-1.5 mono uppercase">Risk level</label>
                <div className="flex gap-1.5">
                  {['normal', 'sensitive', 'emergency'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => mutate((d) => updatePower(d, selectedPower.id, { riskLevel: lvl }))}
                      className="flex-1 rounded-lg py-1.5 text-[11px] hairline capitalize"
                      style={{
                        background: selectedPower.riskLevel === lvl ? 'var(--ink4)' : 'transparent',
                        color: selectedPower.riskLevel === lvl ? 'var(--bone)' : 'var(--ash)'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-ash mb-1.5 mono uppercase">Assigned to</label>
                <div className="space-y-1">
                  {draft.roles.length === 0 && <p className="text-xs text-mute">No roles yet.</p>}
                  {draft.roles.map((r) => {
                    const has = (selectedPower.assignedTo || []).includes(r.id)
                    return (
                      <button
                        key={r.id}
                        onClick={() => mutate((d) => togglePowerAssignment(d, selectedPower.id, r.id))}
                        className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs hairline"
                        style={{ background: has ? 'var(--ink4)' : 'transparent', color: has ? 'var(--bone)' : 'var(--ash)' }}
                      >
                        <span>{r.name}</span>
                        <span className="mono text-[9px] text-ash">{has ? 'linked' : 'link'}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <button
                onClick={() => {
                  mutate((d) => removePower(d, selectedPower.id))
                  setSelected(null)
                  push('Power removed', 'ember')
                }}
                className="w-full rounded-lg py-2 text-xs text-crimson hairline"
              >
                Remove power
              </button>
            </div>
          )}
        </FloatingInspector>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg px-2.5 py-2 hairline" style={{ background: 'var(--ink1)' }}>
      <div className="text-ash">{label}</div>
      <div className="text-bone tabular text-sm">{value}</div>
    </div>
  )
}
