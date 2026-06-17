/*
  VaultOfSystems.jsx
  A vault of saved orbital systems as floating capsules. Open, duplicate,
  delete, export and import JSON, filter by stability and risk, search by name.
*/
import React, { useMemo, useState } from 'react'
import ModeHeader from '../components/layout/ModeHeader.jsx'
import VaultCapsule from '../components/vault/VaultCapsule.jsx'
import ImportExportPanel from '../components/shared/ImportExportPanel.jsx'
import EmptyState from '../components/shared/EmptyState.jsx'
import { useStore } from '../state/store.jsx'
import { calculateAuthorityGravity } from '../utils/gravityEngine.js'
import { downloadJSON } from '../utils/exportImport.js'
import { useToast } from '../components/shared/Toast.jsx'

export default function VaultOfSystems({ onOpenSystem }) {
  const { systems, deleteSystem, duplicateSystem, importSystem, loadIntoDraft } = useStore()
  const { push } = useToast()
  const [query, setQuery] = useState('')
  const [stabFilter, setStabFilter] = useState('all') // all | stable | unstable
  const [riskFilter, setRiskFilter] = useState('all') // all | high | low

  const enriched = useMemo(
    () => systems.map((s) => ({ system: s, metrics: calculateAuthorityGravity(s) })),
    [systems]
  )

  const filtered = useMemo(() => {
    return enriched.filter(({ system, metrics }) => {
      if (query && !system.protocolName.toLowerCase().includes(query.toLowerCase())) return false
      if (stabFilter === 'stable' && metrics.authorityStability < 60) return false
      if (stabFilter === 'unstable' && metrics.authorityStability >= 60) return false
      if (riskFilter === 'high' && metrics.emergencyRisk < 60) return false
      if (riskFilter === 'low' && metrics.emergencyRisk >= 60) return false
      return true
    })
  }, [enriched, query, stabFilter, riskFilter])

  const open = (system) => {
    loadIntoDraft(system)
    push(`${system.protocolName} loaded`, 'sage')
    onOpenSystem && onOpenSystem()
  }

  return (
    <div className="h-full flex flex-col">
      <ModeHeader
        kicker="Vault of Systems"
        title="Saved Orbital Systems"
        hint="Each system is an orbital capsule. Open one to keep designing, or export and import systems as JSON."
        actions={<ImportExportPanel onImport={(s) => { importSystem(s) }} exportData={systems} exportName="orbitarium-vault.json" label="Vault" />}
      />

      <div className="px-6 pb-3 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name"
          className="rounded-lg px-3 py-2 text-sm text-bone bg-[var(--ink1)] hairline outline-none focus:border-[var(--sage)] w-52"
        />
        <Segmented label="Stability" value={stabFilter} onChange={setStabFilter} options={[['all', 'All'], ['stable', 'Stable'], ['unstable', 'Unstable']]} />
        <Segmented label="Risk" value={riskFilter} onChange={setRiskFilter} options={[['all', 'All'], ['high', 'High'], ['low', 'Low']]} />
        <span className="mono text-[10px] text-mute ml-auto">{filtered.length} / {systems.length} systems</span>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-8">
        {filtered.length === 0 ? (
          <EmptyState title="No systems match" hint="Adjust the filters or import a system JSON to populate the vault." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(({ system }) => (
              <VaultCapsule
                key={system.systemId}
                system={system}
                onOpen={() => open(system)}
                onDuplicate={() => { duplicateSystem(system.systemId); push('System duplicated', 'champagne') }}
                onDelete={() => { deleteSystem(system.systemId); push('System deleted', 'ember') }}
                onExport={() => downloadJSON(system, `${system.protocolName.replace(/\s+/g, '-').toLowerCase()}.json`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Segmented({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="mono text-[10px] uppercase text-ash">{label}</span>
      <div className="flex rounded-lg hairline overflow-hidden">
        {options.map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => onChange(val)}
            className="px-2.5 py-1.5 text-[11px]"
            style={{ background: value === val ? 'var(--ink4)' : 'transparent', color: value === val ? 'var(--bone)' : 'var(--ash)' }}
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>
  )
}
