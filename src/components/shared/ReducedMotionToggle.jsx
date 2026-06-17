/*
  ReducedMotionToggle.jsx
  A small reusable switch component.
*/
import React from 'react'

export default function ReducedMotionToggle({ checked, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-full text-left"
      role="switch"
      aria-checked={checked}
    >
      <span
        className="relative inline-flex items-center rounded-full transition-colors"
        style={{
          width: 40,
          height: 22,
          background: checked ? 'var(--sage)' : 'var(--ink4)',
          border: '1px solid var(--line2)'
        }}
      >
        <span
          className="absolute rounded-full transition-all"
          style={{
            width: 16,
            height: 16,
            top: 2,
            left: checked ? 20 : 2,
            background: 'var(--bone)'
          }}
        />
      </span>
      {label && <span className="text-sm text-bone2">{label}</span>}
    </button>
  )
}
