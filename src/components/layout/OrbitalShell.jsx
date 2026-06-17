/*
  OrbitalShell.jsx
  The frame around the instrument: starfield backdrop, top bar with the mark,
  GenLayer status and wallet, plus the mode rail on the left.
*/
import React, { useEffect, useState } from 'react'
import Starfield from '../animations/Starfield.jsx'
import ModeSwitcher from './ModeSwitcher.jsx'
import WalletButton from '../shared/WalletButton.jsx'
import { useStore } from '../../state/store.jsx'
import { getGenLayerStatus } from '../../genlayer/genlayerClient.js'

function Mark() {
  return (
    <div className="flex items-center gap-2.5 no-select">
      <svg width="26" height="26" viewBox="0 0 26 26">
        <circle cx="13" cy="13" r="11" fill="none" stroke="var(--line2)" />
        <ellipse cx="13" cy="13" rx="11" ry="4.5" fill="none" stroke="var(--sage)" opacity="0.7" />
        <circle cx="13" cy="13" r="2.6" fill="var(--bone)" />
        <circle cx="24" cy="13" r="1.4" fill="var(--champagne)" />
      </svg>
      <div className="leading-none">
        <div className="font-head text-[15px] tracking-tight text-bone">Orbitarium</div>
        <div className="mono text-[9px] uppercase tracking-[0.2em] text-ash mt-0.5">Map the gravity of power</div>
      </div>
    </div>
  )
}

export default function OrbitalShell({ mode, onChange, children }) {
  const { settings } = useStore()
  const [status, setStatus] = useState(null)

  useEffect(() => {
    let active = true
    getGenLayerStatus().then((s) => {
      if (active) setStatus(s)
    })
    return () => {
      active = false
    }
  }, [settings.genlayerMode])

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: 'var(--ink0)' }}>
      <div className="absolute inset-0 opacity-90">
        <Starfield />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(1100px 700px at 50% -10%, var(--sage-glow), transparent 60%)' }}
      />

      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-5 h-14 border-b" style={{ borderColor: 'var(--line1)' }}>
        <Mark />
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5 hairline" style={{ background: 'var(--ink1)' }}>
            <span
              className="inline-block rounded-full"
              style={{ width: 7, height: 7, background: status?.online ? 'var(--sage)' : 'var(--ember)', boxShadow: status?.online ? '0 0 7px var(--sage)' : 'none' }}
            />
            <span className="mono text-[10px] uppercase tracking-wider text-ash">
              {(settings.genlayerMode || 'live') === 'mock'
                ? 'GenLayer mock'
                : status?.online
                ? 'GenLayer live'
                : 'GenLayer Bradbury'}
            </span>
          </div>
          <WalletButton />
        </div>
      </header>

      <div className="relative z-10 flex" style={{ height: 'calc(100% - 3.5rem)' }}>
        {/* Mode rail */}
        <aside className="shrink-0 border-r flex flex-col items-center" style={{ borderColor: 'var(--line1)', width: 60, background: 'color-mix(in srgb, var(--ink1) 70%, transparent)' }}>
          <ModeSwitcher mode={mode} onChange={onChange} />
        </aside>

        {/* Mode content */}
        <main className="flex-1 min-w-0 relative">{children}</main>
      </div>
    </div>
  )
}
