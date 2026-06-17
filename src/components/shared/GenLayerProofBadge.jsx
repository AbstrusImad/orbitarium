/*
  GenLayerProofBadge.jsx
  Shows a GenLayer proof. In mock mode this is a simulated proof (network, tx
  hash, validators, agreement). In live mode it is the real Bradbury proof:
  verified, with the tx hash and an explorer link to the contract.
*/
import React from 'react'

export default function GenLayerProofBadge({ proof, compact = false }) {
  if (!proof) return null
  const verified = Boolean(proof.verified)
  return (
    <div className={`rounded-xl hairline ${compact ? 'p-3' : 'p-4'}`} style={{ background: 'var(--ink1)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="mono text-[10px] uppercase tracking-widest text-sagetext" style={{ color: 'var(--sage)' }}>GenLayer Proof</span>
        <span
          className="mono text-[10px] uppercase px-2 py-0.5 rounded-full"
          style={
            verified
              ? { color: 'var(--sage)', border: '1px solid var(--sage)' }
              : { color: 'var(--ash)' }
          }
        >
          {verified ? 'verified on genlayer' : 'mock'}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-1.5 mono text-[11px] text-bone2">
        <Row k="network" v={proof.network || 'genlayer-mock'} />
        {proof.txHash && <Row k="tx" v={proof.txHash} truncate />}
        {proof.contract && <Row k="contract" v={proof.contract} truncate />}
        {proof.blockHeight && <Row k="block" v={String(proof.blockHeight)} />}
        {proof.validators && <Row k="validators" v={String(proof.validators)} />}
        {proof.agreement != null && <Row k="agreement" v={`${proof.agreement}%`} />}
        {proof.consensus && <Row k="consensus" v={proof.consensus} />}
      </div>
      {verified && proof.explorerUrl && (
        <a
          href={proof.explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-2.5 mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full hairline"
          style={{ color: 'var(--sage)' }}
        >
          View on explorer
        </a>
      )}
    </div>
  )
}

function Row({ k, v, truncate }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ash">{k}</span>
      <span className={`text-bone ${truncate ? 'truncate max-w-[160px]' : ''}`}>{v}</span>
    </div>
  )
}
