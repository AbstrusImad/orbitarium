/*
  orbitLayout.js
  Pure layout math for the orbital map. Maps roles to polar positions around
  the core and resolves where each power route and constraint ring sits.
*/
export const VIEW = { w: 1000, h: 680, cx: 500, cy: 340 }

export function radiusFor(orbitDistance) {
  return 96 + (orbitDistance || 40) * 2.3
}

export function angleFor(role, index, total) {
  if (typeof role.angle === 'number') return role.angle
  const golden = 2.39996
  return -Math.PI / 2 + index * (total > 6 ? golden : (Math.PI * 2) / Math.max(1, total))
}

export function layoutSystem(system) {
  const roles = system.roles || []
  const total = roles.length
  const rolePos = {}
  roles.forEach((role, i) => {
    const r = radiusFor(role.orbitDistance)
    const a = angleFor(role, i, total)
    rolePos[role.id] = {
      x: VIEW.cx + Math.cos(a) * r,
      y: VIEW.cy + Math.sin(a) * r,
      r,
      angle: a
    }
  })

  // Each power route attaches at the midpoint between its assigned roles and
  // the core. Powers with one holder sit on that role's route.
  const powerPos = {}
  ;(system.powers || []).forEach((p) => {
    const holders = (p.assignedTo || []).map((id) => rolePos[id]).filter(Boolean)
    if (holders.length === 0) {
      powerPos[p.id] = { x: VIEW.cx, y: VIEW.cy - 40, holders: [] }
      return
    }
    const mx = holders.reduce((s, h) => s + h.x, 0) / holders.length
    const my = holders.reduce((s, h) => s + h.y, 0) / holders.length
    powerPos[p.id] = {
      x: (mx + VIEW.cx) / 2,
      y: (my + VIEW.cy) / 2,
      holders: p.assignedTo || []
    }
  })

  return { rolePos, powerPos }
}

export function positionToOrbit(x, y) {
  const dx = x - VIEW.cx
  const dy = y - VIEW.cy
  const r = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx)
  const orbitDistance = Math.max(0, Math.min(100, (r - 96) / 2.3))
  return { orbitDistance, angle }
}
