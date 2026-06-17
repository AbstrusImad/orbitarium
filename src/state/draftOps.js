/*
  draftOps.js
  Pure helpers to evolve a working authority system. Each returns a new object.
*/
import { shortId } from '../utils/formatters.js'
import { roleByKey } from '../data/roleLibrary.js'
import { powerByKey } from '../data/powerLibrary.js'
import { constraintByKey } from '../data/constraintLibrary.js'

function nextId(list, prefix) {
  let i = 1
  // Find a free id of the form prefixN.
  // eslint-disable-next-line no-loop-func
  while (list.some((x) => x.id === `${prefix}${i}`)) i++
  return `${prefix}${i}`
}

export function createCore(system, name) {
  return {
    ...system,
    protocolName: name || system.protocolName || 'Untitled Protocol',
    core: { name: name || system.protocolName || 'Protocol', type: 'protocol' }
  }
}

export function addRole(system, key) {
  const meta = roleByKey(key)
  if (!meta) return system
  const roles = system.roles || []
  const id = nextId(roles, 'r')
  const role = {
    id,
    key: meta.key,
    name: meta.name,
    authorityWeight: meta.authorityWeight,
    orbitDistance: meta.orbitDistance,
    visibility: meta.visibility,
    tone: meta.tone
  }
  return { ...system, roles: [...roles, role] }
}

export function addPower(system, key, assignTo) {
  const meta = powerByKey(key)
  if (!meta) return system
  const powers = system.powers || []
  const id = nextId(powers, 'p')
  const power = {
    id,
    key: meta.key,
    name: meta.name,
    riskLevel: meta.riskLevel,
    type: meta.scope,
    assignedTo: assignTo ? [assignTo] : [],
    reviewRequired: meta.reviewRequired,
    treasury: meta.treasury,
    cooldown: meta.defaultCooldown
  }
  return { ...system, powers: [...powers, power] }
}

export function addConstraint(system, key, appliesTo) {
  const meta = constraintByKey(key)
  if (!meta) return system
  const constraints = system.constraints || []
  const id = nextId(constraints, 'c')
  const constraint = {
    id,
    key: meta.key,
    name: meta.name,
    type: meta.form,
    appliesTo: appliesTo ? [appliesTo] : []
  }
  return { ...system, constraints: [...constraints, constraint] }
}

export function updateRole(system, roleId, patch) {
  return { ...system, roles: (system.roles || []).map((r) => (r.id === roleId ? { ...r, ...patch } : r)) }
}

export function updatePower(system, powerId, patch) {
  return { ...system, powers: (system.powers || []).map((p) => (p.id === powerId ? { ...p, ...patch } : p)) }
}

export function togglePowerAssignment(system, powerId, roleId) {
  return {
    ...system,
    powers: (system.powers || []).map((p) => {
      if (p.id !== powerId) return p
      const set = new Set(p.assignedTo || [])
      if (set.has(roleId)) set.delete(roleId)
      else set.add(roleId)
      return { ...p, assignedTo: [...set] }
    })
  }
}

export function setConstraintTarget(system, constraintId, appliesTo) {
  return {
    ...system,
    constraints: (system.constraints || []).map((c) => (c.id === constraintId ? { ...c, appliesTo } : c))
  }
}

export function removeRole(system, roleId) {
  return {
    ...system,
    roles: (system.roles || []).filter((r) => r.id !== roleId),
    powers: (system.powers || []).map((p) => ({ ...p, assignedTo: (p.assignedTo || []).filter((id) => id !== roleId) }))
  }
}

export function removePower(system, powerId) {
  return {
    ...system,
    powers: (system.powers || []).filter((p) => p.id !== powerId),
    constraints: (system.constraints || []).map((c) => ({ ...c, appliesTo: (c.appliesTo || []).filter((id) => id !== powerId) }))
  }
}

export function removeConstraint(system, constraintId) {
  return { ...system, constraints: (system.constraints || []).filter((c) => c.id !== constraintId) }
}

export function ensureId(system) {
  if (system.systemId) return system
  return { ...system, systemId: shortId('sys') }
}
