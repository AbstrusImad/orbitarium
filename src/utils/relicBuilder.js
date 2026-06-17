/*
  relicBuilder.js
  Builds the Authority Relic, a sealed visual object summarizing a system.
*/
import { generateAuthoritySystem } from './authorityEngine.js'
import { powerByKey } from '../data/powerLibrary.js'
import { fakeHash } from './formatters.js'

export function buildRelic(rawSystem) {
  const full = generateAuthoritySystem(rawSystem)
  const m = full.metrics

  const mainRoles = [...(full.roles || [])]
    .sort((a, b) => (b.authorityWeight || 0) - (a.authorityWeight || 0))
    .slice(0, 5)
    .map((r) => r.name)

  const criticalPowers = (full.powers || [])
    .filter((p) => {
      const meta = powerByKey(p.key) || {}
      return p.riskLevel === 'emergency' || meta.critical
    })
    .map((p) => p.name)

  const constraints = (full.constraints || []).map((c) => c.name)

  const seal = fakeHash(`relic:${full.systemId}:${m.authorityStability}:${m.centralizationGravity}`)

  return {
    kind: 'authority-relic',
    systemId: full.systemId,
    protocolName: full.protocolName,
    miniMap: {
      core: full.core,
      roles: (full.roles || []).map((r) => ({ id: r.id, name: r.name, orbitDistance: r.orbitDistance, authorityWeight: r.authorityWeight, tone: r.tone })),
      powers: (full.powers || []).map((p) => ({ id: p.id, name: p.name, riskLevel: p.riskLevel, assignedTo: p.assignedTo }))
    },
    mainRoles,
    criticalPowers,
    constraints,
    metrics: {
      authorityStability: m.authorityStability,
      centralizationGravity: m.centralizationGravity,
      communityDistance: m.communityDistance,
      safeguardCoverage: m.safeguardCoverage,
      emergencyRisk: m.emergencyRisk
    },
    topIssue: full.detectedIssues[0] || null,
    detectedIssues: full.detectedIssues,
    mockProof: full.mockProof,
    seal,
    sealedAt: new Date().toISOString()
  }
}
