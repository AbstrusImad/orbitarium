/*
  WeightDial.jsx
  A draggable-like dial for authority weight, implemented as a styled range.
*/
import React from 'react'

export default function WeightDial({ label, value, min = 0, max = 100, onChange, tone = 'var(--sage)' }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-bone2">{label}</span>
        <span className="mono text-xs tabular" style={{ color: tone }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full orb-range"
        style={{ accentColor: tone }}
      />
    </div>
  )
}
