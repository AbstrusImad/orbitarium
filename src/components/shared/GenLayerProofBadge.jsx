/*
  GenLayerProofBadge.jsx
  Shows a mock GenLayer proof: network, tx hash, validators, agreement.
*/
import React from 'react'

export default function GenLayerProofBadge({ proof, compact = false }) {
  if (!proof) return null
  return (
    <div className={`rounded-xl hairline ${compact ? 'p-3' : 'p-4'}`} style={{ background: 'var(--ink1)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="mono text-[10px] uppercase tracking-widest text-sagetext">GenLayer Proof</span>
        <span className="mono text-[10px] text-ash">mock</span>
      </div>
      <div className="grid grid-cols-1 gap-1.5 mono text-[11px] text-bone2">
        <Row k="network" v={proof.network || 'genlayer-mock'} />
        {proof.txHash && <Row k="tx" v={proof.txHash} truncate />}
        {proof.blockHeight && <Row k="block" v={String(proof.blockHeight)} />}
        {proof.validators && <Row k="validators" v={String(proof.validators)} />}
        {proof.agreement != null && <Row k="agreement" v={`${proof.agreement}%`} />}
        {proof.consensus && <Row k="consensus" v={proof.consensus} />}
      </div>
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
