/*
  mockGenLayer.js
  Fully local mock of a GenLayer Intelligent Contract client. No network calls.
  Simulates latency and returns fake hashes and status objects so the UI can
  demonstrate the on-chain flow without any backend.
*/
import { calculateAuthorityGravity } from '../utils/gravityEngine.js'
import { detectIssues } from '../utils/authorityEngine.js'
import { fakeHash } from '../utils/formatters.js'

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const RECORDS = new Map()

export async function createAuthorityRecord(system) {
  await delay(420)
  const metrics = calculateAuthorityGravity(system)
  const record = {
    systemId: system.systemId,
    protocolName: system.protocolName,
    txHash: fakeHash(`record:${system.systemId}`),
    blockHeight: 1_000_000 + RECORDS.size * 11,
    storedAt: new Date().toISOString(),
    metrics
  }
  RECORDS.set(system.systemId, record)
  return record
}

export async function analyzeAuthorityTopology(system) {
  await delay(560)
  const metrics = calculateAuthorityGravity(system)
  const issues = detectIssues(system, metrics)
  return {
    systemId: system.systemId,
    topology: {
      roleCount: (system.roles || []).length,
      powerCount: (system.powers || []).length,
      constraintCount: (system.constraints || []).length,
      criticalRoutes: metrics.riskyAuthorityRoutes.length
    },
    classification: metrics.centralizationGravity >= 70 ? 'centralized' : metrics.centralizationGravity >= 45 ? 'mixed' : 'distributed',
    issues,
    agreement: Math.min(100, 62 + Math.round(metrics.authorityStability / 4))
  }
}

export async function registerAuthorityRelic(relic) {
  await delay(640)
  return {
    relicId: relic.systemId,
    seal: relic.seal,
    txHash: fakeHash(`relic-reg:${relic.systemId}`),
    registeredAt: new Date().toISOString(),
    status: 'sealed'
  }
}

export async function getMockProof(systemId) {
  await delay(220)
  return {
    systemId,
    txHash: fakeHash(`proof:${systemId}`),
    network: 'genlayer-mock',
    consensus: 'optimistic-mock',
    validators: 5,
    verified: true,
    fetchedAt: new Date().toISOString()
  }
}

export async function getGenLayerStatus() {
  await delay(160)
  return {
    network: 'genlayer-mock',
    online: true,
    latencyMs: 160,
    block: 1_000_000 + RECORDS.size * 11,
    note: 'Local mock. No network calls are made.'
  }
}
