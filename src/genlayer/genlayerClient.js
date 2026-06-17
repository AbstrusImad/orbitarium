/*
  genlayerClient.js
  Thin façade over the local mock. A real deployment would swap this module
  for a client that talks to a GenLayer node. Here it stays fully local and
  respects a mock-mode flag persisted in settings.
*/
import * as mock from './mockGenLayer.js'

let mockEnabled = true

export function setGenLayerMockMode(enabled) {
  mockEnabled = !!enabled
}

export function isGenLayerMockMode() {
  return mockEnabled
}

function ensureMock() {
  // There is no real backend in this product. When mock mode is off we still
  // return a clearly labeled offline response rather than making any network
  // call, honoring the no-API constraint.
  if (!mockEnabled) {
    return {
      offline: true,
      note: 'GenLayer mock mode is off. No network calls are performed in this build.'
    }
  }
  return null
}

export async function createAuthorityRecord(system) {
  const off = ensureMock()
  if (off) return { ...off, systemId: system.systemId }
  return mock.createAuthorityRecord(system)
}

export async function analyzeAuthorityTopology(system) {
  const off = ensureMock()
  if (off) return { ...off, systemId: system.systemId }
  return mock.analyzeAuthorityTopology(system)
}

export async function registerAuthorityRelic(relic) {
  const off = ensureMock()
  if (off) return { ...off, relicId: relic.systemId }
  return mock.registerAuthorityRelic(relic)
}

export async function getMockProof(systemId) {
  const off = ensureMock()
  if (off) return { ...off, systemId }
  return mock.getMockProof(systemId)
}

export async function getGenLayerStatus() {
  const off = ensureMock()
  if (off) return { network: 'genlayer-mock', online: false, ...off }
  return mock.getGenLayerStatus()
}
