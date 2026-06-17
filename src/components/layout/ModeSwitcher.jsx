/*
  ModeSwitcher.jsx
  Vertical rail of instrument lenses. Switching feels like changing the orbital
  lens, not navigating dashboard pages.
*/
import React from 'react'
import { motion } from 'framer-motion'
import { IconCanvas, IconBodies, IconForge, IconLens, IconMotion, IconRelic, IconVault, IconSettings } from './ModeIcons.jsx'

export const MODES = [
  { key: 'canvas', label: 'Orbit Canvas', Icon: IconCanvas },
  { key: 'bodies', label: 'Power Bodies', Icon: IconBodies },
  { key: 'forge', label: 'Constraint Forge', Icon: IconForge },
  { key: 'lens', label: 'Gravity Lens', Icon: IconLens },
  { key: 'motion', label: 'Stability Motion', Icon: IconMotion },
  { key: 'relic', label: 'Authority Relic', Icon: IconRelic },
  { key: 'vault', label: 'Vault of Systems', Icon: IconVault },
  { key: 'settings', label: 'Settings', Icon: IconSettings }
]

export default function ModeSwitcher({ mode, onChange }) {
  return (
    <nav className="flex flex-col items-center gap-1.5 py-4">
      {MODES.map((m) => {
        const active = mode === m.key
        return (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            className="group relative flex items-center justify-center rounded-xl transition-colors"
            style={{
              width: 44,
              height: 44,
              color: active ? 'var(--sage-text)' : 'var(--ash)',
              background: active ? 'var(--ink3)' : 'transparent'
            }}
            title={m.label}
            aria-label={m.label}
          >
            {active && (
              <motion.span
                layoutId="mode-active"
                className="absolute left-0 rounded-full"
                style={{ width: 3, height: 22, background: 'var(--sage)', boxShadow: '0 0 8px var(--sage)' }}
              />
            )}
            <m.Icon />
            <span
              className="pointer-events-none absolute left-[52px] whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 glass"
              style={{ color: 'var(--bone)' }}
            >
              {m.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
