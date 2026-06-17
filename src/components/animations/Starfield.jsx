/*
  Starfield.jsx
  A very fine particle field rendered on canvas. devicePixelRatio aware,
  pauses when the tab is hidden, and respects motion intensity.
*/
import React, { useEffect, useRef } from 'react'
import { useMotionPrefs } from '../../state/useMotionPrefs.js'

export default function Starfield({ density = 0.00018 }) {
  const ref = useRef(null)
  const { intensity, reduced } = useMotionPrefs()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = 0
    let running = true
    let stars = []
    let w = 0
    let h = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.max(40, Math.floor(w * h * density))
      stars = new Array(count).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.2,
        a: Math.random() * 0.5 + 0.1,
        tw: Math.random() * 0.02 + 0.004,
        p: Math.random() * Math.PI * 2
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        s.p += s.tw * (intensity || 0.001)
        const alpha = reduced ? s.a : s.a + Math.sin(s.p) * 0.25
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(184, 194, 206, ${Math.max(0.04, alpha)})`
        ctx.fill()
      }
      if (running && !reduced) raf = requestAnimationFrame(draw)
    }

    function onVisibility() {
      running = !document.hidden
      if (running && !reduced) {
        raf = requestAnimationFrame(draw)
      } else {
        cancelAnimationFrame(raf)
      }
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [intensity, reduced, density])

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />
}
