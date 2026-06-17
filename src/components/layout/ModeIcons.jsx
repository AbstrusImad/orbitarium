/*
  ModeIcons.jsx
  Minimal line-art glyphs for each instrument mode. No emoji, pure SVG.
*/
import React from 'react'

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function IconCanvas() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="2.2" />
      <ellipse cx="12" cy="12" rx="9" ry="5" />
      <circle cx="21" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconBodies() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base}>
      <circle cx="8" cy="8" r="3" />
      <circle cx="16.5" cy="15.5" r="2" />
      <circle cx="17" cy="7" r="1.4" />
    </svg>
  )
}

export function IconForge() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3.4" strokeDasharray="2 2" />
    </svg>
  )
}

export function IconLens() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base}>
      <path d="M3 14c4-6 14-6 18 0" />
      <path d="M3 10c4 6 14 6 18 0" opacity="0.5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconMotion() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 3a9 9 0 0 1 8 5" />
      <path d="M12 21a9 9 0 0 1-8-5" />
      <path d="M19 5l1.5 1L21 4" />
    </svg>
  )
}

export function IconRelic() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base}>
      <path d="M12 3l7 4v6c0 4-3 6-7 8-4-2-7-4-7-8V7z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  )
}

export function IconVault() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 8.6v-1M12 16.4v-1M8.6 12h-1M16.4 12h-1" />
    </svg>
  )
}

export function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
    </svg>
  )
}

export function IconVoid() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="2.4" />
      <circle cx="12" cy="12" r="8" strokeDasharray="1 4" />
    </svg>
  )
}
