// realGenLayer.js
// The live GenLayer plumbing for Orbitarium on the Bradbury testnet. This file
// mirrors the verified genlayer-js reference: a read client, a wallet client
// that signs through the injected provider (MetaMask), resilient reads with
// backoff, transaction status naming, a leader peek that reads the in-flight
// relic draft, and a poller that follows a tx until consensus decides.
//
// This module is pure plumbing. The public surface (createAuthorityRecord,
// analyzeAuthorityTopology, registerAuthorityRelic, getGenLayerStatus, ...)
// lives in genlayerClient.js, which routes between this and the local mock.

import { createClient } from 'genlayer-js'
import { testnetBradbury } from 'genlayer-js/chains'

// ---- live contract coordinates ------------------------------------------
// The parent wires the real address and deploy tx after deployment, then
// rebuilds. Until then these are the zero placeholders.
export const CONTRACT_ADDRESS = '0xA877f907e6f48cb388C7e87b3FCC68C53C1AE0f3'
export const DEPLOY_TX = '0xdd411ecb9e5a3400059f7b9977203097c8fad37b99f2cd275b6069b12275b4ad'
export const EXPLORER = 'https://explorer-bradbury.genlayer.com'
export const FAUCET = 'https://testnet-faucet.genlayer.foundation/'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// Plain string compare. This is JavaScript, so there is no type concern with
// comparing the placeholder to the zero address.
export const IS_DEPLOYED =
  String(CONTRACT_ADDRESS).toLowerCase() !== ZERO_ADDRESS.toLowerCase()

const ADDRESS = CONTRACT_ADDRESS

// ---- clients -------------------------------------------------------------

export const readClient = createClient({ chain: testnetBradbury })

// When the account is a plain address and an injected provider is present,
// genlayer-js routes signing methods through the provider, so writeContract
// signs in MetaMask.
export function makeWalletClient(account) {
  const provider = typeof window !== 'undefined' ? window.ethereum : undefined
  return createClient({ chain: testnetBradbury, account, provider })
}

// ---- input limits mirrored from the contract ----------------------------

export const LIMITS = {
  name: { min: 1, max: 80 },
  system: { min: 2, max: 4000 }
}

// Closed sets shared with the contract.
export const RISK_CLASSES = ['Distributed', 'Balanced', 'Concentrated', 'Centralized', 'Critical']
export const SEVERITIES = ['Low', 'Medium', 'High', 'Critical']
const DEFAULT_RISK_CLASS = 'Balanced'
const DEFAULT_SEVERITY = 'Medium'

// ---- resilient reads -----------------------------------------------------

export async function withRpcRetry(fn, tries = 4) {
  let last
  for (let i = 0; i < tries; i += 1) {
    try {
      return await fn()
    } catch (e) {
      last = e
      if (!/rate limit|429|timeout|network|fetch|too many/i.test(String(e))) throw e
      // backoff: 2.5s, 5s, 10s, 20s
      await new Promise((r) => setTimeout(r, 2500 * 2 ** i))
    }
  }
  throw last
}

// ---- normalization -------------------------------------------------------

function toRecord(value) {
  if (value instanceof Map) {
    const obj = {}
    for (const [k, v] of value.entries()) obj[String(k)] = normalize(v)
    return obj
  }
  return value
}

function normalize(value) {
  if (value instanceof Map) return toRecord(value)
  if (Array.isArray(value)) return value.map(normalize)
  if (typeof value === 'bigint') return value.toString()
  return value
}

function num(v) {
  if (typeof v === 'number') return v
  if (typeof v === 'bigint') return Number(v)
  const n = Number(String(v == null ? '0' : v))
  return Number.isFinite(n) ? n : 0
}

function str(v) {
  return String(v == null ? '' : v)
}

function clampScore(raw) {
  const n = Math.round(num(raw))
  if (n < 0) return 0
  if (n > 100) return 100
  return n
}

function coerceRiskClass(raw) {
  const low = str(raw).trim().toLowerCase()
  for (const rc of RISK_CLASSES) if (low === rc.toLowerCase()) return rc
  return DEFAULT_RISK_CLASS
}

function coerceSeverity(raw) {
  const low = str(raw).trim().toLowerCase()
  for (const s of SEVERITIES) if (low === s.toLowerCase()) return s
  return DEFAULT_SEVERITY
}

function normalizeIssues(raw) {
  const out = []
  if (Array.isArray(raw)) {
    for (const item of raw.slice(0, 8)) {
      const r = toRecord(item)
      if (!r || typeof r !== 'object') continue
      out.push({
        name: str(r.name).slice(0, 80),
        severity: coerceSeverity(r.severity),
        reason: str(r.reason).slice(0, 200),
        suggestion: str(r.suggestion).slice(0, 200)
      })
    }
  }
  return out
}

// ---- system JSON building + capping --------------------------------------

// Build id -> name maps so an authority map authored with internal ids is sent
// to the contract (and read by the AI) with meaningful human readable names.
function roleNameMap(system) {
  const map = new Map()
  for (const r of system.roles || []) map.set(r.id, r.name)
  return map
}

function powerNameMap(system) {
  const map = new Map()
  for (const p of system.powers || []) map.set(p.id, p.name)
  return map
}

// Turn an Orbitarium authority system into the JSON STRING the contract expects:
// {core:{name,type}, roles:[{name,authorityWeight}],
//  powers:[{name,risk,assignedTo:[...]}],
//  constraints:[{name,type,appliesTo:[...]}]}
export function buildSystemJson(system) {
  const roleNames = roleNameMap(system)
  const powerNames = powerNameMap(system)
  const core = system.core || {}
  const payload = {
    core: {
      name: str(core.name || system.protocolName || 'Protocol').slice(0, 80),
      type: str(core.type || 'protocol').slice(0, 80)
    },
    roles: (system.roles || []).map((r) => ({
      name: str(r.name).slice(0, 80),
      authorityWeight: clampScore(r.authorityWeight)
    })),
    powers: (system.powers || []).map((p) => ({
      name: str(p.name).slice(0, 80),
      risk: str(p.riskLevel || p.risk || 'normal').slice(0, 80),
      assignedTo: (p.assignedTo || []).map((id) => str(roleNames.get(id) || id).slice(0, 80))
    })),
    constraints: (system.constraints || []).map((c) => ({
      name: str(c.name).slice(0, 80),
      type: str(c.type).slice(0, 80),
      appliesTo: (c.appliesTo || []).map((id) => str(powerNames.get(id) || id).slice(0, 80))
    }))
  }
  return JSON.stringify(payload)
}

// Validate and cap the inputs. Throws an expected style error when a field is
// out of range so the UI can surface it before signing.
export function capInputs(system) {
  const rawName = str(system.protocolName || (system.core && system.core.name) || 'Untitled Protocol').trim()
  const protocolName = rawName.slice(0, LIMITS.name.max)
  if (protocolName.length < LIMITS.name.min) {
    throw new Error(`[EXPECTED] Protocol name must be ${LIMITS.name.min}-${LIMITS.name.max} characters`)
  }
  const systemJson = buildSystemJson(system)
  if (systemJson.length < LIMITS.system.min || systemJson.length > LIMITS.system.max) {
    throw new Error(`[EXPECTED] System must be ${LIMITS.system.min}-${LIMITS.system.max} characters`)
  }
  return { protocolName, systemJson }
}

// ---- on-chain relic normalization ----------------------------------------

// Normalize a raw on-chain relic record (Map or object) into a stable shape.
export function normalizeRelic(raw) {
  const r = toRecord(raw) || {}
  return {
    id: str(r.id),
    protocolName: str(r.protocolName),
    riskClass: coerceRiskClass(r.riskClass),
    authorityStability: clampScore(r.authorityStability),
    centralizationGravity: clampScore(r.centralizationGravity),
    communityDistance: clampScore(r.communityDistance),
    safeguardCoverage: clampScore(r.safeguardCoverage),
    emergencyRisk: clampScore(r.emergencyRisk),
    issues: normalizeIssues(r.issues),
    summary: str(r.summary),
    systemHash: str(r.systemHash),
    author: str(r.author),
    created: num(r.created)
  }
}

// ---- reads ---------------------------------------------------------------

export async function fetchRelics(start = 0) {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_relics', args: [start] })
  )
  const arr = normalize(raw) || []
  return (Array.isArray(arr) ? arr : []).map(normalizeRelic)
}

export async function fetchRelic(id) {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_relic', args: [id] })
  )
  return normalizeRelic(normalize(raw))
}

export async function fetchStats() {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_stats', args: [] })
  )
  const r = toRecord(normalize(raw)) || {}
  return {
    relics: num(r.relics),
    systems: num(r.systems),
    analyses: num(r.analyses)
  }
}

// ---- writes --------------------------------------------------------------

export function writeAnalyze(client, protocolName, systemJson) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'analyze',
    args: [protocolName, systemJson],
    value: 0n
  })
}

// register_system exists on-chain as a deterministic (non-AI) registration, but
// Orbitarium keeps system creation local and instant. This helper is provided
// for completeness if a caller ever wants the on-chain record.
export function writeRegisterSystem(client, protocolName, systemJson) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'register_system',
    args: [protocolName, systemJson],
    value: 0n
  })
}

// ---- transaction polling -------------------------------------------------

const STATUS_NAME = {
  1: 'PENDING',
  2: 'PROPOSING',
  3: 'COMMITTING',
  4: 'REVEALING',
  5: 'ACCEPTED',
  6: 'UNDETERMINED',
  7: 'FINALIZED',
  8: 'CANCELED',
  12: 'VALIDATORS_TIMEOUT',
  13: 'LEADER_TIMEOUT'
}

export function statusName(s) {
  return STATUS_NAME[String(s)] || String(s == null ? 'PENDING' : s).toUpperCase()
}

// LEADER_TIMEOUT / VALIDATORS_TIMEOUT are intentionally absent: the network
// rotates the leader and retries, so keep polling through them.
export const TERMINAL = new Set(['ACCEPTED', 'FINALIZED', 'UNDETERMINED', 'CANCELED'])

function pick(obj, key) {
  if (obj instanceof Map) return obj.get(key)
  if (obj && typeof obj === 'object') return obj[key]
  return undefined
}

function decodeBase64(b64) {
  try {
    if (typeof atob === 'function') return atob(b64)
  } catch (e) {
    /* fall through */
  }
  try {
    // Node / SSR fallback. Browsers use atob above.
    return Buffer.from(b64, 'base64').toString('binary')
  } catch (e) {
    return ''
  }
}

// Peek at the leader's in-flight result. The contract's leader returns the FULL
// normalized relic, and the raw prompt output is captured in the first
// equivalence output, so we scan it for the JSON object and return the draft
// risk class, the five metrics, the issues and the summary.
export function extractLeaderDraft(tx) {
  try {
    const receipts = pick(pick(tx, 'consensus_data'), 'leader_receipt')
    const first = Array.isArray(receipts) ? receipts[0] : receipts
    const b64 = pick(pick(first, 'eq_outputs'), '0')
    if (typeof b64 !== 'string' || b64.length === 0) return null
    const text = decodeBase64(b64)
    for (let i = text.length - 1; i >= 0; i -= 1) {
      if (text[i] !== '{') continue
      try {
        const obj = JSON.parse(text.slice(i))
        if (obj && typeof obj === 'object' && ('centralizationGravity' in obj || 'riskClass' in obj)) {
          return {
            riskClass: coerceRiskClass(obj.riskClass),
            authorityStability: clampScore(obj.authorityStability),
            centralizationGravity: clampScore(obj.centralizationGravity),
            communityDistance: clampScore(obj.communityDistance),
            safeguardCoverage: clampScore(obj.safeguardCoverage),
            emergencyRisk: clampScore(obj.emergencyRisk),
            issues: normalizeIssues(obj.issues),
            summary: str(obj.summary)
          }
        }
      } catch (e) {
        /* keep scanning toward the start for a parseable object */
      }
    }
    return null
  } catch (e) {
    return null
  }
}

export async function pollUntilDecided(client, hash, onUpdate) {
  let draft = null
  for (let i = 0; i < 150; i += 1) {
    const tx = await client.getTransaction({ hash }).catch(() => null)
    const status = statusName(tx ? tx.status : 'PENDING')
    draft = extractLeaderDraft(tx) || draft
    if (typeof onUpdate === 'function') onUpdate(status, draft)
    if (TERMINAL.has(status)) return { status, draft }
    await new Promise((r) => setTimeout(r, 8000))
  }
  return { status: 'TIMEOUT', draft }
}
