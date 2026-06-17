/*
  authorityEngine.js
  Orchestrates a complete authority system object from raw editor input.
  Pure and local: combines the gravity engine with issue detection and a
  mock proof. No network calls.

  generateAuthoritySystem(input) -> {
    systemId, protocolName, core, roles, powers, constraints,
    metrics, detectedIssues, mockProof
  }
*/
import { calculateAuthorityGravity } from './gravityEngine.js'
import { powerByKey } from '../data/powerLibrary.js'
import { fakeHash, shortId, severityRank } from './formatters.js'

const CRITICAL_TRIO = new Set(['pause-protocol', 'move-treasury', 'upgrade-contracts'])

function powersForRole(system, roleId) {
  return system.powers.filter((p) => (p.assignedTo || []).includes(roleId))
}

function constraintsForPower(system, powerId) {
  return (system.constraints || []).filter((c) => (c.appliesTo || []).includes(powerId))
}

export function detectIssues(system, metrics) {
  const issues = []
  const roles = system.roles || []

  // Critical capture: a single role holding the dangerous trio.
  roles.forEach((role) => {
    const keys = new Set(powersForRole(system, role.id).map((p) => p.key))
    const held = [...CRITICAL_TRIO].filter((k) => keys.has(k))
    if (held.length >= 3) {
      issues.push({
        name: `${role.name} Authority Mass`,
        severity: 'critical',
        reason: `${role.name} can Pause Protocol, Move Treasury and Upgrade Contracts. This concentrates protocol-ending power in one body.`,
        suggestion: 'Split these powers across independent roles or gate them behind multisig and timelock.'
      })
    } else if (held.length === 2) {
      issues.push({
        name: `${role.name} Power Cluster`,
        severity: 'high',
        reason: `${role.name} holds two of three critical powers (${held.join(', ')}).`,
        suggestion: 'Distribute one of these powers to a separate role or add a challenge window.'
      })
    }
  })

  // Unchecked emergency powers.
  ;(system.powers || []).forEach((p) => {
    if (p.riskLevel === 'emergency') {
      const own = constraintsForPower(system, p.id)
      const classCovered = (system.constraints || []).some(
        (c) => (c.key === 'sunset-clause' || c.key === 'emergency-expiry') && (c.appliesTo || []).includes('emergency-class')
      )
      if (own.length === 0 && !classCovered) {
        issues.push({
          name: `Unconstrained ${p.name}`,
          severity: 'high',
          reason: `${p.name} is an emergency power with no cooldown, review or expiry.`,
          suggestion: 'Attach a cooldown, an execution timelock or an emergency expiry.'
        })
      }
    }
  })

  // Treasury powers without review.
  ;(system.powers || []).forEach((p) => {
    const meta = powerByKey(p.key) || {}
    if (meta.treasury) {
      const cs = constraintsForPower(system, p.id)
      const reviewed = cs.some((c) => c.key === 'public-review' || c.key === 'independent-review' || c.key === 'multisig')
      if (!reviewed) {
        issues.push({
          name: `${p.name} Treasury Exposure`,
          severity: 'medium',
          reason: `${p.name} moves value with no review or multisig gate.`,
          suggestion: 'Add public review, independent review or a multisig requirement.'
        })
      }
    }
  })

  // Distant community.
  if (metrics.communityDistance >= 60) {
    issues.push({
      name: 'Community in Weak Orbit',
      severity: 'medium',
      reason: `Community distance is ${metrics.communityDistance}. The community holds little mass and sits far from the core.`,
      suggestion: 'Add a challenge window, lower community orbit distance or grant a review power.'
    })
  }

  // High centralization.
  if (metrics.centralizationGravity >= 75) {
    issues.push({
      name: 'Centralization Gravity Well',
      severity: 'high',
      reason: `Centralization gravity is ${metrics.centralizationGravity}. One body bends the system toward itself.`,
      suggestion: 'Redistribute critical powers and add collective constraints such as quorum or multisig.'
    })
  }

  return issues.sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
}

export function buildMockProof(system, metrics) {
  return {
    network: 'genlayer-mock',
    method: 'create_authority_record',
    systemId: system.systemId,
    txHash: fakeHash(`${system.systemId}:${system.protocolName}`),
    blockHeight: 1_000_000 + (system.roles?.length || 0) * 7 + (system.powers?.length || 0) * 3,
    consensus: 'optimistic-mock',
    validators: 5,
    agreement: metrics ? Math.min(100, 60 + Math.round(metrics.authorityStability / 4)) : 70,
    sealedAt: new Date().toISOString()
  }
}

export function generateAuthoritySystem(input) {
  const system = {
    systemId: input.systemId || shortId('sys'),
    protocolName: input.protocolName || (input.core && input.core.name) || 'Untitled Protocol',
    createdAt: input.createdAt || new Date().toISOString(),
    core: input.core || { name: input.protocolName || 'Protocol', type: 'protocol' },
    roles: input.roles || [],
    powers: input.powers || [],
    constraints: input.constraints || []
  }

  const metrics = calculateAuthorityGravity(system)
  const detectedIssues = detectIssues(system, metrics)
  const mockProof = buildMockProof(system, metrics)

  return { ...system, metrics, detectedIssues, mockProof }
}
