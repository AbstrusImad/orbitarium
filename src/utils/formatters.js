/*
  formatters.js
  Small pure helpers for display.
*/
export function clampScore(n) {
  return Math.max(0, Math.min(100, Math.round(n || 0)))
}

export function scoreBand(score) {
  if (score >= 75) return 'high'
  if (score >= 45) return 'moderate'
  return 'low'
}

export function riskTone(level) {
  if (level === 'emergency') return 'crimson'
  if (level === 'sensitive') return 'ember'
  return 'sage'
}

export function severityRank(sev) {
  return { critical: 3, high: 2, medium: 1, low: 0 }[sev] ?? 0
}

export function shortId(prefix = 'sys') {
  const t = Date.now().toString(36)
  const r = Math.floor(Math.random() * 1e6).toString(36)
  return `${prefix}-${t}${r}`
}

export function fakeHash(seed) {
  // Deterministic-ish pseudo hash for mock proofs, no crypto needed.
  let h = 0x811c9dc5
  const str = String(seed)
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  const hex = (h >>> 0).toString(16).padStart(8, '0')
  return `0x${hex}${hex.split('').reverse().join('')}`.slice(0, 42)
}

export function formatDate(iso) {
  try {
    const d = new Date(iso)
    return d.toISOString().slice(0, 10)
  } catch (e) {
    return '----'
  }
}

export function pct(n) {
  return `${clampScore(n)}%`
}

export function truncateAddress(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 5)}...${addr.slice(-4)}`
}
