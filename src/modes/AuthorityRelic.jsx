/*
  AuthorityRelic.jsx
  Generate the sealed relic for the working system. In mock mode this is instant
  and fully local. In live mode it runs the real GenLayer Bradbury flow: confirm
  in wallet, submitted (tx hash + explorer), consensus deliberating (live status
  and a peeked leader draft forming), then the authoritative relic, or a friendly
  error with retry. The relic can be exported as JSON or saved to the vault.
*/
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ModeHeader from '../components/layout/ModeHeader.jsx'
import RelicSeal from '../components/relic/RelicSeal.jsx'
import ConsensusOverlay from '../components/relic/ConsensusOverlay.jsx'
import EmptyState from '../components/shared/EmptyState.jsx'
import { useStore } from '../state/store.jsx'
import { ensureId } from '../state/draftOps.js'
import { downloadJSON } from '../utils/exportImport.js'
import { analyzeAuthorityTopology, getGenLayerMode, describeGenLayerError } from '../genlayer/genlayerClient.js'
import { useWallet } from '../genlayer/wallet.js'
import { useToast } from '../components/shared/Toast.jsx'

export default function AuthorityRelic() {
  const { draft, saveSystem, setDraft } = useStore()
  const { push } = useToast()
  const wallet = useWallet()
  const [relic, setRelic] = useState(null)
  const [sealing, setSealing] = useState(false)

  // Live consensus lifecycle.
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [stage, setStage] = useState('idle') // idle|wallet|submitted|consensus|confirmed|error
  const [txHash, setTxHash] = useState(null)
  const [liveStatus, setLiveStatus] = useState(null)
  const [peeked, setPeeked] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const canSeal = draft.core && draft.roles.length > 0
  const isMock = getGenLayerMode() === 'mock'
  const needsWallet = !isMock && !wallet.address

  function onStage(name, info) {
    if (name === 'wallet') {
      setStage('wallet')
    } else if (name === 'submitted') {
      setStage('submitted')
      setTxHash(info.txHash)
    } else if (name === 'consensus') {
      setStage('consensus')
      setLiveStatus(info.status)
      if (info.draft) setPeeked(info.draft)
      if (info.txHash) setTxHash(info.txHash)
    } else if (name === 'confirmed') {
      setStage('confirmed')
      if (info.relic) setRelic(info.relic)
      setOverlayOpen(false)
    } else if (name === 'error') {
      setStage('error')
      setErrorMsg(info.message)
    }
  }

  async function runSeal() {
    const system = ensureId(draft)
    setSealing(true)
    setErrorMsg(null)
    setTxHash(null)
    setPeeked(null)

    if (isMock) {
      try {
        const built = await analyzeAuthorityTopology(system, { onStage })
        setRelic(built)
        push('Authority Relic sealed', 'sage')
      } catch (err) {
        push(describeGenLayerError(err), 'crimson')
      } finally {
        setSealing(false)
      }
      return
    }

    // Live mode: drive the consensus overlay.
    setStage('wallet')
    setOverlayOpen(true)
    try {
      const built = await analyzeAuthorityTopology(system, { onStage })
      setRelic(built)
      setStage('confirmed')
      push('Authority Relic notarized on GenLayer', 'sage')
    } catch (err) {
      setStage('error')
      setErrorMsg(describeGenLayerError(err))
    } finally {
      setSealing(false)
    }
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
    <div className="h-full flex flex-col relative">
      <ModeHeader
        kicker="Authority Relic"
        title="Seal the System"
        hint={
          isMock
            ? 'The relic is a sealed object: a mini orbital map, the headline figures, the critical powers and a GenLayer proof.'
            : 'Sealing runs real AI consensus on GenLayer Bradbury. Confirm in your wallet, then watch the gravity field form as validators deliberate.'
        }
        actions={
          <div className="flex items-center gap-2">
            <button onClick={runSeal} disabled={sealing} className="rounded-lg px-4 py-2 text-xs font-medium" style={{ background: 'var(--sage)', color: 'var(--sage-ink)' }}>
              {sealing ? (isMock ? 'Sealing...' : 'Notarizing...') : relic ? 'Re-seal' : isMock ? 'Generate Relic' : 'Notarize on GenLayer'}
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
              hint={isMock ? 'Generate the relic to seal the current system into an exportable authority object.' : 'Notarize the current system to seal an authoritative relic through GenLayer AI consensus.'}
            />
          </motion.div>
        )}
      </div>

      <ConsensusOverlay
        open={overlayOpen}
        stage={stage}
        needsWallet={needsWallet}
        walletError={wallet.error}
        connecting={wallet.connecting}
        onConnect={async () => {
          await wallet.connect()
        }}
        txHash={txHash}
        liveStatus={liveStatus}
        peeked={peeked}
        errorMsg={errorMsg}
        onRetry={runSeal}
        onClose={() => setOverlayOpen(false)}
      />
    </div>
  )
}
