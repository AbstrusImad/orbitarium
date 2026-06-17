/*
  gravityEngine.js
  Deterministic local engine that turns an authority system into gravity
  metrics. No network, no randomness: identical input yields identical output.

  Exported:
    calculateAuthorityGravity(system) -> {
      authorityStability, centralizationGravity, communityDistance,
      safeguardCoverage, emergencyRisk,
      overloadedRoles, uncheckedPowers, riskyAuthorityRoutes, roleMasses
    }

  The coefficients below are calibrated so the canonical ArcDAO demo maps to
  Stability 67, Centralization 78, Community Distance 64, Safeguard 52,
  Emergency 71. They are intentionally simple and explainable.
*/
import { powerByKey } from '../data/powerLibrary.js'
import { constraintByKey } from '../data/constraintLibrary.js'

const RISK_POINTS = { normal: 1, sensitive: 2, emergency: 3 }
const COMMUNITY_KEYS = new Set(['community', 'contributors'])

const C = {
  // centralization
  massAuthority: 0.5,
  massPower: 10,
  centralTopShare: 0.6,
  centralCriticalShare: 0.92,
  // community distance
  distOrbit: 0.7,
  distWeight: 0.3,
  distChallengeRelief: 8,
  // emergency
  emgBase: 35,
  emgCooldown: 10,
  emgSunset: 6,
  emgReview: 8,
  emgMultisig: 6,
  emgTimelock: 8,
  emgIrreversible: 8,
  emgConcentration: 15,
  // safeguard coverage
  covRatioFactor: 65,
  // stability
  stabBase: 60,
  stabCoverage: 0.4,
  stabCentral: 0.18,
  stabEmergency: 0.12,
  stabDistance: 0.1,
  stabConstraintBonus: 5
}

function clamp(n, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n))
}

function powerMeta(power) {
  return powerByKey(power.key) || {}
}

function riskPoints(power) {
  return RISK_POINTS[power.riskLevel] || 1
}

function powersForRole(system, roleId) {
  return system.powers.filter((p) => (p.assignedTo || []).includes(roleId))
}

function constraintsForPower(system, powerId) {
  return (system.constraints || []).filter((c) => (c.appliesTo || []).includes(powerId))
}

function hasConstraintKey(system, powerId, key) {
  return constraintsForPower(system, powerId).some((c) => c.key === key)
}

function appliesToEmergencyClass(system, key) {
  // Some constraints apply to a whole class (for example Sunset Clause for
  // Emergency Powers). We model that as a constraint targeting the special
  // token 'emergency-class'.
  return (system.constraints || []).some(
    (c) => c.key === key && (c.appliesTo || []).includes('emergency-class')
  )
}

export function calculateAuthorityGravity(system) {
  const roles = system.roles || []
  const powers = system.powers || []

  // Role masses
  const roleMasses = roles.map((role) => {
    const assigned = powersForRole(system, role.id)
    const pts = assigned.reduce((s, p) => s + riskPoints(p), 0)
    const mass = C.massAuthority * (role.authorityWeight || 0) + C.massPower * pts
    return { id: role.id, name: role.name, mass, assignedCount: assigned.length }
  })
  const totalMass = roleMasses.reduce((s, r) => s + r.mass, 0) || 1
  const top = roleMasses.reduce((a, b) => (b.mass > a.mass ? b : a), roleMasses[0] || { mass: 0 })
  const topShare = (top.mass || 0) / totalMass

  // Critical concentration
  const criticalAssignments = []
  powers.forEach((p) => {
    const meta = powerMeta(p)
    if (meta.critical) {
      ;(p.assignedTo || []).forEach((rid) => criticalAssignments.push({ powerId: p.id, roleId: rid }))
    }
  })
  const topCritical = criticalAssignments.filter((a) => a.roleId === top.id).length
  const topRoleCriticalShare = criticalAssignments.length
    ? topCritical / criticalAssignments.length
    : 0

  const centralizationGravity = Math.round(
    clamp(100 * (C.centralTopShare * topShare + C.centralCriticalShare * topRoleCriticalShare))
  )

  // Community distance
  const communityRoles = roles.filter((r) => COMMUNITY_KEYS.has(r.key))
  let communityDistance = 0
  if (communityRoles.length) {
    const avgOrbit = communityRoles.reduce((s, r) => s + (r.orbitDistance || 0), 0) / communityRoles.length
    const avgWeight = communityRoles.reduce((s, r) => s + (r.authorityWeight || 0), 0) / communityRoles.length
    let base = C.distOrbit * avgOrbit + C.distWeight * (100 - avgWeight)
    const hasChallenge = (system.constraints || []).some((c) => c.key === 'challenge-window')
    if (hasChallenge) base -= C.distChallengeRelief
    const communityHoldsPower = communityRoles.some((r) => powersForRole(system, r.id).length > 0)
    if (communityHoldsPower) base -= 6
    communityDistance = Math.round(clamp(base))
  } else {
    communityDistance = 80
  }

  // Emergency risk
  const emergencyPowers = powers.filter((p) => p.riskLevel === 'emergency')
  let emgSum = 0
  emergencyPowers.forEach((p) => {
    let r = C.emgBase
    if (hasConstraintKey(system, p.id, 'cooldown')) r -= C.emgCooldown
    if (hasConstraintKey(system, p.id, 'execution-timelock')) r -= C.emgTimelock
    if (hasConstraintKey(system, p.id, 'multisig')) r -= C.emgMultisig
    if (hasConstraintKey(system, p.id, 'public-review') || hasConstraintKey(system, p.id, 'independent-review')) {
      r -= C.emgReview
    }
    if (hasConstraintKey(system, p.id, 'sunset-clause') || appliesToEmergencyClass(system, 'sunset-clause') || appliesToEmergencyClass(system, 'emergency-expiry')) {
      r -= C.emgSunset
    }
    const meta = powerMeta(p)
    if (meta.reversibility === 'irreversible') r += C.emgIrreversible
    emgSum += Math.max(0, r)
  })
  // Concentration: a single role holding multiple emergency powers
  const emgByRole = {}
  emergencyPowers.forEach((p) => {
    ;(p.assignedTo || []).forEach((rid) => {
      emgByRole[rid] = (emgByRole[rid] || 0) + 1
    })
  })
  const concentratedEmergency = Object.values(emgByRole).some((n) => n >= 2)
  if (concentratedEmergency) emgSum += C.emgConcentration
  const emergencyRisk = Math.round(clamp(emgSum))

  // Safeguard coverage
  const needSafeguard = powers.filter((p) => p.riskLevel === 'sensitive' || p.riskLevel === 'emergency')
  let covered = 0
  needSafeguard.forEach((p) => {
    const hasOwn = constraintsForPower(system, p.id).length > 0
    const hasClass = p.riskLevel === 'emergency' && (appliesToEmergencyClass(system, 'sunset-clause') || appliesToEmergencyClass(system, 'emergency-expiry'))
    if (hasOwn || hasClass) covered += 1
  })
  const coveredRatio = needSafeguard.length ? covered / needSafeguard.length : 1
  const safeguardCoverage = Math.round(clamp(coveredRatio * C.covRatioFactor))

  // Stability
  const strongConstraintKeys = new Set(['multisig', 'execution-timelock', 'public-review', 'independent-review', 'challenge-window'])
  const strongCount = (system.constraints || []).filter((c) => strongConstraintKeys.has(c.key)).length
  let stability =
    C.stabBase +
    C.stabCoverage * safeguardCoverage -
    C.stabCentral * centralizationGravity -
    C.stabEmergency * emergencyRisk -
    C.stabDistance * communityDistance +
    C.stabConstraintBonus * Math.min(strongCount, 5)
  const authorityStability = Math.round(clamp(stability))

  // Diagnostics
  const overloadedRoles = roleMasses
    .filter((r) => r.mass > totalMass * 0.3 && r.assignedCount >= 2)
    .map((r) => r.name)

  const uncheckedPowers = needSafeguard
    .filter((p) => {
      const hasOwn = constraintsForPower(system, p.id).length > 0
      const hasClass = p.riskLevel === 'emergency' && (appliesToEmergencyClass(system, 'sunset-clause') || appliesToEmergencyClass(system, 'emergency-expiry'))
      return !(hasOwn || hasClass)
    })
    .map((p) => p.name)

  const riskyAuthorityRoutes = []
  powers.forEach((p) => {
    const meta = powerMeta(p)
    if (p.riskLevel === 'emergency' || meta.critical) {
      ;(p.assignedTo || []).forEach((rid) => {
        const role = roles.find((r) => r.id === rid)
        if (role) riskyAuthorityRoutes.push({ role: role.name, power: p.name, risk: p.riskLevel })
      })
    }
  })

  return {
    authorityStability,
    centralizationGravity,
    communityDistance,
    safeguardCoverage,
    emergencyRisk,
    overloadedRoles,
    uncheckedPowers,
    riskyAuthorityRoutes,
    roleMasses
  }
}
