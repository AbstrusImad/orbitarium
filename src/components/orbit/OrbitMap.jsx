/*
  OrbitMap.jsx
  The reusable orbital renderer. Composes the core, orbit rings, authority
  bodies, power comets, constraint forms, the safeguard belt and an optional
  gravity field. Supports pan, zoom and radial dragging of bodies.
*/
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { VIEW, layoutSystem, radiusFor, positionToOrbit } from './orbitLayout.js'
import ProtocolCore from './ProtocolCore.jsx'
import OrbitRing from './OrbitRing.jsx'
import AuthorityBody from './AuthorityBody.jsx'
import AuthorityRoute from './AuthorityRoute.jsx'
import PowerComet from './PowerComet.jsx'
import SafeguardBelt from './SafeguardBelt.jsx'
import ConstraintRing from '../constraints/ConstraintRing.jsx'
import GravityField from '../gravity/GravityField.jsx'
import { useMotionPrefs } from '../../state/useMotionPrefs.js'

const TONE_VALUE = { crimson: 'var(--crimson)', ember: 'var(--ember)', sage: 'var(--sage)', champagne: 'var(--champagne)' }

export default function OrbitMap({
  system,
  selected,
  onSelect,
  onDragRole,
  interactive = true,
  showGravity = false,
  showBelt = true,
  metrics,
  className = ''
}) {
  const { reduced } = useMotionPrefs()
  const svgRef = useRef(null)
  const [view, setView] = useState({ x: 0, y: 0, w: VIEW.w, h: VIEW.h })
  const dragRef = useRef(null)
  const panRef = useRef(null)

  const { rolePos, powerPos } = useMemo(() => layoutSystem(system), [system])

  const overloaded = useMemo(() => new Set(metrics?.overloadedRoles || []), [metrics])

  const toSvgPoint = useCallback((clientX, clientY) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const p = pt.matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }, [])

  const onWheel = useCallback(
    (e) => {
      if (!interactive) return
      e.preventDefault()
      const scale = e.deltaY > 0 ? 1.1 : 0.9
      setView((v) => {
        const newW = Math.max(420, Math.min(1700, v.w * scale))
        const newH = newW * (VIEW.h / VIEW.w)
        const p = toSvgPoint(e.clientX, e.clientY)
        const rx = (p.x - v.x) / v.w
        const ry = (p.y - v.y) / v.h
        return { w: newW, h: newH, x: p.x - rx * newW, y: p.y - ry * newH }
      })
    },
    [interactive, toSvgPoint]
  )

  const onBgPointerDown = useCallback(
    (e) => {
      if (!interactive) return
      panRef.current = { sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, w: view.w }
    },
    [interactive, view]
  )

  const onPointerMove = useCallback(
    (e) => {
      if (dragRef.current) {
        const p = toSvgPoint(e.clientX, e.clientY)
        const { orbitDistance, angle } = positionToOrbit(p.x, p.y)
        onDragRole && onDragRole(dragRef.current.roleId, { orbitDistance: Math.round(orbitDistance), angle })
        return
      }
      if (panRef.current) {
        const k = view.w / (svgRef.current?.clientWidth || VIEW.w)
        const dx = (e.clientX - panRef.current.sx) * k
        const dy = (e.clientY - panRef.current.sy) * k
        setView((v) => ({ ...v, x: panRef.current.vx - dx, y: panRef.current.vy - dy }))
      }
    },
    [onDragRole, toSvgPoint, view.w]
  )

  const endInteraction = useCallback(() => {
    dragRef.current = null
    panRef.current = null
  }, [])

  const startBodyDrag = useCallback(
    (roleId, e) => {
      if (!interactive || !onDragRole) return
      e.stopPropagation()
      dragRef.current = { roleId }
    },
    [interactive, onDragRole]
  )

  const constraintsByPower = useMemo(() => {
    const map = {}
    ;(system.constraints || []).forEach((c) => {
      ;(c.appliesTo || []).forEach((t) => {
        if (!map[t]) map[t] = []
        map[t].push(c)
      })
    })
    return map
  }, [system])

  const gravityWells = useMemo(() => {
    if (!showGravity) return []
    const masses = metrics?.roleMasses || []
    const max = Math.max(1, ...masses.map((m) => m.mass))
    return masses
      .map((m) => {
        const pos = rolePos[m.id]
        if (!pos) return null
        const role = system.roles.find((r) => r.id === m.id)
        return { x: pos.x, y: pos.y, mass: m.mass / max, tone: role?.tone }
      })
      .filter(Boolean)
  }, [showGravity, metrics, rolePos, system])

  return (
    <svg
      ref={svgRef}
      viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
      className={`w-full h-full touch-none ${className}`}
      onWheel={onWheel}
      onPointerDown={onBgPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endInteraction}
      onPointerLeave={endInteraction}
      onClick={() => onSelect && onSelect(null, null)}
      style={{ cursor: interactive ? 'grab' : 'default' }}
    >
      {showGravity && <GravityField wells={gravityWells} strength={1} />}

      {showBelt && <SafeguardBelt coverage={metrics?.safeguardCoverage || 0} reduced={reduced} />}

      {/* Orbit rings */}
      {(system.roles || []).map((role) => (
        <OrbitRing key={`ring-${role.id}`} cx={VIEW.cx} cy={VIEW.cy} r={radiusFor(role.orbitDistance)} reduced={reduced} />
      ))}

      {/* Routes from core to roles */}
      {(system.roles || []).map((role) => {
        const pos = rolePos[role.id]
        if (!pos) return null
        const active = selected?.id === role.id
        return (
          <AuthorityRoute
            key={`route-${role.id}`}
            x1={VIEW.cx}
            y1={VIEW.cy}
            x2={pos.x}
            y2={pos.y}
            tone={role.tone}
            active={active}
          />
        )
      })}

      {/* Power routes from holders to power node */}
      {(system.powers || []).map((power) => {
        const pp = powerPos[power.id]
        if (!pp) return null
        const active = selected?.id === power.id
        return (power.assignedTo || []).map((rid) => {
          const rp = rolePos[rid]
          if (!rp) return null
          return (
            <AuthorityRoute
              key={`proute-${power.id}-${rid}`}
              x1={rp.x}
              y1={rp.y}
              x2={pp.x}
              y2={pp.y}
              tone={power.riskLevel === 'emergency' ? 'crimson' : 'champagne'}
              risk={power.riskLevel}
              active={active}
            />
          )
        })
      })}

      {/* Constraints */}
      {(system.powers || []).map((power) => {
        const pp = powerPos[power.id]
        const cs = constraintsByPower[power.id] || []
        return cs.map((c, i) => <ConstraintRing key={`c-${c.id}-${power.id}`} constraint={c} pos={pp} index={i} reduced={reduced} />)
      })}

      <ProtocolCore
        x={VIEW.cx}
        y={VIEW.cy}
        name={system.core?.name || system.protocolName}
        selected={selected?.type === 'core'}
        onSelect={() => onSelect && onSelect('core', 'core')}
        reduced={reduced}
      />

      {/* Power comets */}
      {(system.powers || []).map((power) => {
        const pp = powerPos[power.id]
        if (!pp) return null
        return (
          <PowerComet
            key={`comet-${power.id}`}
            power={power}
            pos={pp}
            selected={selected?.id === power.id}
            onSelect={() => onSelect && onSelect('power', power.id)}
            reduced={reduced}
          />
        )
      })}

      {/* Bodies */}
      {(system.roles || []).map((role) => {
        const pos = rolePos[role.id]
        if (!pos) return null
        return (
          <AuthorityBody
            key={`body-${role.id}`}
            role={role}
            pos={pos}
            selected={selected?.id === role.id}
            overloaded={overloaded.has(role.name)}
            onSelect={() => onSelect && onSelect('role', role.id)}
            onPointerDown={(e) => startBodyDrag(role.id, e)}
            reduced={reduced}
          />
        )
      })}
    </svg>
  )
}
