/*
  stabilityEngine.js
  Drives the Stability Motion simulation. Produces a deterministic set of
  per-body simulation parameters plus the final compact metrics. The actual
  animation is rendered on a canvas; this module only computes the physics
  intent so motion is reproducible and explainable.
*/
import { calculateAuthorityGravity } from './gravityEngine.js'
import { powerByKey } from '../data/powerLibrary.js'

function powersForRole(system, roleId) {
  return system.powers.filter((p) => (p.assignedTo || []).includes(roleId))
}

function constraintsForRolePowers(system, roleId) {
  const powerIds = powersForRole(system, roleId).map((p) => p.id)
  return (system.constraints || []).filter((c) => (c.appliesTo || []).some((t) => powerIds.includes(t)))
}

/*
  buildSimulationModel(system)
  Returns the bodies and routes with motion intent:
    pull:      how strongly the body attracts others (mass based)
    tremor:    instability from unconstrained dangerous powers
    isComet:   emergency powers crossing the system
    stabilized:constraints damping the motion
*/
export function buildSimulationModel(system) {
  const gravity = calculateAuthorityGravity(system)
  const massById = {}
  gravity.roleMasses.forEach((r) => {
    massById[r.id] = r.mass
  })
  const maxMass = Math.max(1, ...gravity.roleMasses.map((r) => r.mass))

  const bodies = (system.roles || []).map((role) => {
    const assigned = powersForRole(system, role.id)
    const emergencyCount = assigned.filter((p) => p.riskLevel === 'emergency').length
    const constraints = constraintsForRolePowers(system, role.id)
    const mass = massById[role.id] || 0
    const pull = mass / maxMass
    const stabilized = Math.min(1, constraints.length / 3)
    const tremor = Math.max(0, (emergencyCount * 0.4 + (assigned.length > 2 ? 0.3 : 0)) - stabilized * 0.5)
    return {
      id: role.id,
      name: role.name,
      key: role.key,
      tone: role.tone,
      orbitDistance: role.orbitDistance,
      pull,
      tremor,
      stabilized,
      emergencyCount
    }
  })

  const comets = []
  ;(system.powers || []).forEach((p) => {
    if (p.riskLevel === 'emergency') {
      const meta = powerByKey(p.key) || {}
      const damped = (system.constraints || []).some(
        (c) => (c.appliesTo || []).includes(p.id) || ((c.key === 'sunset-clause' || c.key === 'emergency-expiry') && (c.appliesTo || []).includes('emergency-class'))
      )
      comets.push({ id: p.id, name: p.name, speed: damped ? 0.4 : 1, critical: !!meta.critical })
    }
  })

  return { bodies, comets, gravity }
}

/*
  runStabilityMotion(system)
  Returns the final compact result shown after the simulation.
*/
export function runStabilityMotion(system) {
  const g = calculateAuthorityGravity(system)
  const synchronized = g.authorityStability >= 65 && g.emergencyRisk <= 55
  const verdict = synchronized
    ? 'Synchronized'
    : g.authorityStability >= 45
      ? 'Wobbling'
      : 'Breaking Orbit'
  return {
    authorityStability: g.authorityStability,
    centralizationGravity: g.centralizationGravity,
    communityDistance: g.communityDistance,
    safeguardCoverage: g.safeguardCoverage,
    emergencyRisk: g.emergencyRisk,
    verdict,
    overloadedRoles: g.overloadedRoles,
    uncheckedPowers: g.uncheckedPowers
  }
}
