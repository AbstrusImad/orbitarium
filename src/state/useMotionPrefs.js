/*
  useMotionPrefs.js
  Resolves whether and how much to animate, based on settings plus the OS
  prefers-reduced-motion query.
*/
import { useEffect, useState } from 'react'
import { useStore } from './store.jsx'

export function useMotionPrefs() {
  const { settings } = useStore()
  const [osReduced, setOsReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setOsReduced(mq.matches)
    update()
    mq.addEventListener ? mq.addEventListener('change', update) : mq.addListener(update)
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', update) : mq.removeListener(update)
    }
  }, [])

  const reduced = settings.reducedMotion || osReduced
  const intensityMap = { low: 0.4, medium: 0.7, high: 1 }
  const intensity = reduced ? 0 : intensityMap[settings.animationIntensity] ?? 1

  return { reduced, intensity }
}
