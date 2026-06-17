/*
  EmptyState.jsx
  A spatial empty state: a faint orbit with a hint, not a generic placeholder.
*/
import React from 'react'

export default function EmptyState({ title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 no-select">
      <svg width="120" height="120" viewBox="0 0 120 120" className="mb-5 opacity-70">
        <circle cx="60" cy="60" r="46" fill="none" stroke="var(--line2)" className="orbit-dotted" />
        <circle cx="60" cy="60" r="30" fill="none" stroke="var(--line1)" />
        <circle cx="60" cy="14" r="3.5" fill="var(--sage)" />
        <circle cx="60" cy="60" r="6" fill="none" stroke="var(--champagne)" />
        <circle cx="60" cy="60" r="2" fill="var(--champagne)" />
      </svg>
      <h3 className="text-base text-bone mb-1.5">{title}</h3>
      {hint && <p className="text-sm text-ash max-w-sm leading-relaxed">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
