/*
  ConstraintForge.jsx
  Create safeguards, each with a distinct visual form, and attach them to
  powers (or to the emergency class). Not a form: a forge of orbital shapes.
*/
import React from 'react'
import { motion } from 'framer-motion'
import ModeHeader from '../components/layout/ModeHeader.jsx'
import ConstraintRing from '../components/constraints/ConstraintRing.jsx'
import { CONSTRAINT_LIBRARY } from '../data/constraintLibrary.js'
import { useStore } from '../state/store.jsx'
import { addConstraint, setConstraintTarget, removeConstraint } from '../state/draftOps.js'
import { useToast } from '../components/shared/Toast.jsx'

function FormPreview({ form }) {
  // Reuse the live ConstraintRing in a tiny svg for a faithful preview.
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <ConstraintRing constraint={{ form }} pos={{ x: 32, y: 32 }} index={0} reduced />
    </svg>
  )
}

export default function ConstraintForge() {
  const { draft, setDraft } = useStore()
  const { push } = useToast()

  const mutate = (fn) => setDraft((d) => fn(d))
  const powers = draft.powers || []
  const constraints = draft.constraints || []

  return (
    <div className="h-full flex flex-col">
      <ModeHeader
        kicker="Constraint Forge"
        title="Forge Safeguards"
        hint="Each safeguard takes a distinct orbital form. Forge one, then bind it to a power or to the whole emergency class."
      />
      <div className="flex-1 overflow-auto px-6 pb-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Catalog */}
        <div>
          <div className="mono text-[10px] uppercase tracking-wider text-ash mb-3">Safeguard forms</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {CONSTRAINT_LIBRARY.map((c) => (
              <motion.button
                key={c.key}
                whileHover={{ scale: 1.04, y: -3 }}
                onClick={() => {
                  mutate((d) => addConstraint(d, c.key))
                  push(`${c.name} forged`, 'champagne')
                }}
                className="group flex flex-col items-center rounded-2xl p-4 hairline text-center"
                style={{ background: 'var(--ink1)' }}
              >
                <FormPreview form={c.form} />
                <div className="text-xs text-bone mt-2 leading-tight">{c.name}</div>
                <p className="text-[10px] text-mute mt-1.5 leading-snug opacity-0 group-hover:opacity-100 transition-opacity">{c.hint}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Active constraints */}
        <div>
          <div className="mono text-[10px] uppercase tracking-wider text-ash mb-3">System safeguards</div>
          <div className="space-y-2">
            {constraints.length === 0 && (
              <div className="rounded-xl p-4 hairline text-sm text-mute" style={{ background: 'var(--ink1)' }}>
                No safeguards yet. Forge one from the catalog.
              </div>
            )}
            {constraints.map((c) => {
              const target = (c.appliesTo || [])[0] || ''
              return (
                <div key={c.id} className="rounded-xl p-3 hairline" style={{ background: 'var(--ink1)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-bone">{c.name}</span>
                    <button onClick={() => mutate((d) => removeConstraint(d, c.id))} className="text-crimson text-xs">remove</button>
                  </div>
                  <label className="block mono text-[9px] uppercase text-ash mb-1">Binds to</label>
                  <select
                    value={target}
                    onChange={(e) => mutate((d) => setConstraintTarget(d, c.id, e.target.value ? [e.target.value] : []))}
                    className="w-full rounded-lg px-2 py-1.5 text-xs text-bone bg-[var(--ink2)] hairline outline-none"
                  >
                    <option value="">Unbound</option>
                    <option value="emergency-class">Emergency class (all emergency powers)</option>
                    {powers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
