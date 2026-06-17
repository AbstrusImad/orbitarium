/*
  GravityField.jsx
  SVG overlay that visibly curves space around high-mass bodies. Used by the
  Gravity Lens. Draws warped grid lines bending toward heavy roles.
*/
import React from 'react'
import { VIEW } from '../orbit/orbitLayout.js'

export default function GravityField({ wells = [], strength = 1 }) {
  // wells: [{ x, y, mass (0..1), tone }]
  const lines = []
  const stepY = 56
  for (let gy = stepY; gy < VIEW.h; gy += stepY) {
    const pts = []
    for (let gx = 0; gx <= VIEW.w; gx += 20) {
      let dy = 0
      wells.forEach((wll) => {
        const dx = gx - wll.x
        const dyy = gy - wll.y
        const dist = Math.sqrt(dx * dx + dyy * dyy) + 1
        const pull = (wll.mass * 2600 * strength) / (dist * 1.4)
        dy += (dyy > 0 ? -1 : 1) * Math.min(36, pull) * (Math.abs(dyy) < 160 ? 1 : 0.2)
      })
      pts.push(`${gx},${gy + dy}`)
    }
    lines.push(pts.join(' '))
  }
  return (
    <g opacity={0.35}>
      {lines.map((p, i) => (
        <polyline key={i} points={p} fill="none" stroke="var(--line2)" strokeWidth={1} />
      ))}
    </g>
  )
}
