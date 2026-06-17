/*
  StabilitySimulator.jsx
  Canvas simulation for the Stability Motion mode. Bodies orbit the core,
  heavy bodies pull the field, unconstrained dangerous powers tremble, and
  emergency powers cross as comets. devicePixelRatio aware, pauses when hidden.
*/
import React, { useEffect, useRef } from 'react'
import { useMotionPrefs } from '../../state/useMotionPrefs.js'

const TONE = {
  crimson: '#D86969',
  ember: '#5E7A8C',
  sage: '#6B9FE3',
  champagne: '#7DD3E0'
}

export default function StabilitySimulator({ model, running = true }) {
  const ref = useRef(null)
  const { intensity, reduced } = useMotionPrefs()
  const modelRef = useRef(model)
  modelRef.current = model

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = 0
    let alive = true
    let w = 0
    let h = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let t = 0

    const bodies = (modelRef.current?.bodies || []).map((b, i) => ({
      ...b,
      angle: (i / Math.max(1, modelRef.current.bodies.length)) * Math.PI * 2,
      baseR: 70 + (b.orbitDistance || 40) * 1.7,
      speed: 0.004 + (1 - (b.orbitDistance || 40) / 100) * 0.006
    }))
    const comets = (modelRef.current?.comets || []).map((c, i) => ({
      ...c,
      phase: i * 1.3
    }))

    function resize() {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw() {
      t += reduced ? 0 : 0.016 * (0.4 + intensity)
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2
      const cy = h / 2

      // Orbit rings
      bodies.forEach((b) => {
        ctx.beginPath()
        ctx.arc(cx, cy, b.baseR, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Core
      const coreGlow = 18 + Math.sin(t) * 3
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, coreGlow)
      grad.addColorStop(0, 'rgba(107,159,227,0.9)')
      grad.addColorStop(1, 'rgba(107,159,227,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, coreGlow, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#EEF2F7'
      ctx.beginPath()
      ctx.arc(cx, cy, 6, 0, Math.PI * 2)
      ctx.fill()

      // Bodies
      bodies.forEach((b) => {
        b.angle += reduced ? 0 : b.speed * (0.5 + intensity)
        const tremor = reduced ? 0 : b.tremor * Math.sin(t * 6 + b.angle * 3) * 6
        const r = b.baseR + tremor
        const x = cx + Math.cos(b.angle) * r
        const y = cy + Math.sin(b.angle) * r
        const size = 6 + b.pull * 14
        const color = TONE[b.tone] || TONE.sage

        // route to core
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(x, y)
        ctx.strokeStyle = b.tremor > 0.4 ? 'rgba(216,105,105,0.25)' : 'rgba(125,211,224,0.14)'
        ctx.lineWidth = 1
        ctx.stroke()

        // body glow
        const bg = ctx.createRadialGradient(x, y, 1, x, y, size + 8)
        bg.addColorStop(0, color)
        bg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.globalAlpha = 0.5
        ctx.fillStyle = bg
        ctx.beginPath()
        ctx.arc(x, y, size + 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Comets crossing
      comets.forEach((c) => {
        const p = reduced ? 0.5 : ((t * c.speed * 0.25 + c.phase) % 2) / 2
        const x = p * w
        const y = cy + Math.sin(p * Math.PI * 2 + c.phase) * (h * 0.28)
        const color = c.critical ? TONE.crimson : TONE.ember
        ctx.beginPath()
        ctx.moveTo(x - 26, y - 8)
        ctx.lineTo(x, y)
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.6
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, 3.5, 0, Math.PI * 2)
        ctx.fill()
      })

      if (alive && running && !reduced) raf = requestAnimationFrame(draw)
    }

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else if (running && !reduced) {
        raf = requestAnimationFrame(draw)
      }
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [model, running, intensity, reduced])

  return <canvas ref={ref} className="w-full h-full block" />
}
