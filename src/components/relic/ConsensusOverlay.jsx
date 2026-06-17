/*
  ConsensusOverlay.jsx
  The live Bradbury consensus lifecycle, rendered in the Orbital Authority
  language. It shows the real stages of an AI consensus analyze: confirm in
  wallet, submitted (tx hash + explorer link), consensus deliberating (live
  status with the peeked leader draft forming, the gravity field intensifying),
  then the authoritative relic, or a friendly error with retry and a faucet
  link. A Bradbury analyze can take one to several minutes.
*/
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AuthorityMeter from '../shared/AuthorityMeter.jsx'
import { EXPLORER, FAUCET } from '../../genlayer/genlayerClient.js'

const STATUS_COPY = {
  PENDING: 'Reaching the validators',
  PROPOSING: 'The leader is reading the authority map',
  COMMITTING: 'Validators are committing',
  REVEALING: 'Validators are revealing',
  LEADER_TIMEOUT: 'Rotating to a fresh leader',
  VALIDATORS_TIMEOUT: 'Waiting on the validator set',
  ACCEPTED: 'Consensus reached',
  FINALIZED: 'Finalized on chain'
}

const RISK_TONE = {
  Distributed: 'var(--sage)',
  Balanced: 'var(--sage)',
  Concentrated: 'var(--champagne)',
  Centralized: 'var(--ember)',
  Critical: 'var(--crimson)'
}

function TxLine({ txHash }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl px-4 py-2 hairline" style={{ background: 'var(--ink0)' }}>
      <code className="mono text-xs break-all text-champagnetext" style={{ color: 'var(--champagne)' }}>
        {txHash.slice(0, 12)}...{txHash.slice(-8)}
      </code>
      <a
        href={`${EXPLORER}/tx/${txHash}`}
        target="_blank"
        rel="noreferrer"
        className="mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full shrink-0 hairline"
        style={{ color: 'var(--sage)' }}
      >
        Explorer
      </a>
    </div>
  )
}

export default function ConsensusOverlay({
  open,
  stage,
  needsWallet,
  walletError,
  connecting,
  onConnect,
  txHash,
  liveStatus,
  peeked,
  errorMsg,
  onRetry,
  onClose
}) {
  const inFlight = stage === 'wallet' || stage === 'submitted' || stage === 'consensus'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-40 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: 'color-mix(in srgb, var(--ink0) 78%, transparent)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            className="w-[min(580px,calc(100%-1rem))] glass rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="mono text-[10px] uppercase tracking-[0.2em] text-sagetext" style={{ color: 'var(--sage)' }}>
                Notarizing on GenLayer Bradbury
              </div>
              {!inFlight && (
                <button onClick={onClose} className="mono text-[10px] uppercase text-ash hover:text-bone">
                  Close
                </button>
              )}
            </div>

            {needsWallet && stage === 'error' ? (
              <div>
                <p className="text-bone text-sm">A wallet holds the seal.</p>
                <p className="text-xs text-ash mt-2 leading-snug">
                  Connect on the GenLayer Bradbury testnet to let the validators read your authority map and seal it on chain.
                </p>
                <button
                  onClick={onConnect}
                  disabled={connecting}
                  className="mt-4 rounded-lg px-4 py-2 text-xs font-medium disabled:opacity-50"
                  style={{ background: 'var(--sage)', color: 'var(--sage-ink)' }}
                >
                  {connecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
                {walletError && <p className="text-xs text-crimson mt-2">{walletError}</p>}
              </div>
            ) : stage === 'error' ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: 'var(--crimson)' }} />
                  <span className="mono text-[10px] uppercase tracking-wider text-ash">The orbit paused</span>
                </div>
                <p className="text-bone text-sm leading-snug">{errorMsg || 'Something interrupted the analysis.'}</p>
                {txHash && <TxLine txHash={txHash} />}
                <div className="flex items-center gap-2 mt-5 flex-wrap">
                  <button onClick={onRetry} className="rounded-lg px-4 py-2 text-xs font-medium" style={{ background: 'var(--sage)', color: 'var(--sage-ink)' }}>
                    Try again
                  </button>
                  <a
                    href={FAUCET}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg px-3 py-2 text-[11px] hairline text-champagnetext"
                    style={{ color: 'var(--champagne)' }}
                  >
                    Open faucet
                  </a>
                  <button onClick={onClose} className="rounded-lg px-3 py-2 text-[11px] hairline text-ash ml-auto">
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <Stages stage={stage} txHash={txHash} liveStatus={liveStatus} peeked={peeked} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Stages({ stage, txHash, liveStatus, peeked }) {
  const steps = [
    { key: 'wallet', label: 'Confirm in your wallet' },
    { key: 'submitted', label: 'Submitted to Bradbury' },
    { key: 'consensus', label: 'Consensus is deliberating' }
  ]
  const order = { wallet: 0, submitted: 1, consensus: 2 }
  const current = order[stage] != null ? order[stage] : 0

  return (
    <div>
      <div className="flex flex-col gap-2">
        {steps.map((s, i) => {
          const done = i < current
          const activeStep = i === current
          return (
            <div
              key={s.key}
              className="flex items-center gap-3 rounded-xl px-4 py-3 hairline"
              style={{ background: activeStep ? 'var(--ink3)' : 'var(--ink2)', borderColor: activeStep ? 'var(--sage)' : 'var(--line1)' }}
            >
              <motion.span
                className="inline-block rounded-full"
                style={{ width: 9, height: 9, background: done || activeStep ? 'var(--sage)' : 'var(--mute)' }}
                animate={activeStep ? { opacity: [1, 0.3, 1], scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="text-sm" style={{ color: done || activeStep ? 'var(--bone)' : 'var(--ash)' }}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {txHash && <TxLine txHash={txHash} />}

      {stage === 'consensus' && (
        <div className="mt-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="mono text-[10px] uppercase tracking-wider text-ash">Validators deliberating</span>
            <span className="mono text-[10px] uppercase px-2 py-1 rounded-full hairline" style={{ color: 'var(--sage)' }}>
              {STATUS_COPY[liveStatus] || liveStatus || 'Working'}
            </span>
          </div>
          <p className="text-xs text-ash mt-2 leading-snug">
            A Bradbury analysis can take from one to several minutes. The gravity field intensifies as the leader proposes a reading.
          </p>

          {peeked && (
            <motion.div
              className="mt-4 rounded-2xl p-4 hairline"
              style={{ background: 'var(--ink1)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <span className="mono text-[10px] uppercase tracking-wider text-ash">Leader draft, forming</span>
                <span
                  className="mono text-[10px] uppercase px-2 py-1 rounded-full"
                  style={{ color: RISK_TONE[peeked.riskClass] || 'var(--champagne)', border: `1px solid ${RISK_TONE[peeked.riskClass] || 'var(--champagne)'}` }}
                >
                  {peeked.riskClass}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <AuthorityMeter label="Centralization" value={peeked.centralizationGravity} invert size={64} />
                <AuthorityMeter label="Stability" value={peeked.authorityStability} size={64} />
                <AuthorityMeter label="Community dist." value={peeked.communityDistance} invert size={64} />
                <AuthorityMeter label="Safeguards" value={peeked.safeguardCoverage} size={64} />
                <AuthorityMeter label="Emergency" value={peeked.emergencyRisk} invert size={64} />
              </div>
              {peeked.summary && <p className="text-sm text-bone2 mt-3 italic leading-snug">{peeked.summary}</p>}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
