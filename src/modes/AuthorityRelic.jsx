/*
  AuthorityRelic.jsx
  Generate the sealed relic for the working system, register it on the mock
  GenLayer, export it as JSON or save it to the vault.
*/
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ModeHeader from '../components/layout/ModeHeader.jsx'
import RelicSeal from '../components/relic/RelicSeal.jsx'
import EmptyState from '../components/shared/EmptyState.jsx'
import { useStore } from '../state/store.jsx'
import { buildRelic } from '../utils/relicBuilder.js'
import { ensureId } from '../state/draftOps.js'
import { downloadJSON } from '../utils/exportImport.js'
import { registerAuthorityRelic } from '../genlayer/genlayerClient.js'
import { useToast } from '../components/shared/Toast.jsx'

export default function AuthorityRelic() {
  const { draft, saveSystem, setDraft } = useStore()
  const { push } = useToast()
  const [relic, setRelic] = useState(null)
  const [sealing, setSealing] = useState(false)

  const canSeal = draft.core && draft.roles.length > 0

  const seal = async () => {
    setSealing(true)
    const built = buildRelic(ensureId(draft))
    const reg = await registerAuthorityRelic(built)
    built.registration = reg
    setRelic(built)
    setSealing(false)
    push('Authority Relic sealed', 'sage')
  }

  if (!canSeal) {
    return (
      <div className="h-full flex flex-col">
        <ModeHeader kicker="Authority Relic" title="Seal the System" />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState title="Nothing to seal yet" hint="Build a core with roles and powers. The relic captures the system as a sealed object." />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <ModeHeader
        kicker="Authority Relic"
        title="Seal the System"
        hint="The relic is a sealed object: a mini orbital map, the headline figures, the critical powers and a GenLayer mock proof."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={seal} disabled={sealing} className="rounded-lg px-4 py-2 text-xs font-medium" style={{ background: 'var(--sage)', color: 'var(--sage-ink)' }}>
              {sealing ? 'Sealing...' : relic ? 'Re-seal' : 'Generate Relic'}
            </button>
            {relic && (
              <>
                <button
                  onClick={() => downloadJSON(relic, `${relic.protocolName.replace(/\s+/g, '-').toLowerCase()}-relic.json`)}
                  className="rounded-lg px-3 py-2 text-xs hairline text-bone2"
                  style={{ background: 'var(--ink2)' }}
                >
                  Export JSON
                </button>
                <button
                  onClick={() => {
                    const saved = saveSystem(ensureId(draft))
                    setDraft(saved)
                    push('Saved to vault', 'sage')
                  }}
                  className="rounded-lg px-3 py-2 text-xs hairline text-bone2"
                  style={{ background: 'var(--ink2)' }}
                >
                  Save to Vault
                </button>
              </>
            )}
          </div>
        }
      />
      <div className="flex-1 overflow-auto px-6 pb-8 flex items-start justify-center">
        {relic ? (
          <div className="w-full max-w-3xl py-2">
            <RelicSeal relic={relic} system={draft} />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center h-full">
            <EmptyState
              title="Relic not generated"
              hint="Generate the relic to seal the current system into an exportable authority object."
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
