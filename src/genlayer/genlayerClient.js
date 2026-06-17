/*
  genlayerClient.js
  The public client surface used by the interface. It keeps a stable set of
  exported names and routes each call between the LIVE GenLayer Bradbury
  contract and the local mock, based on the Settings genlayerMode ('live' or
  'mock'). The default is 'live'.

  Live mode performs the real Bradbury flow: a wallet signed analyze write, a
  poll until consensus decides (with a leader peek so the relic can form while
  validators deliberate), then an authoritative read of the sealed relic. Mock
  mode keeps the original instant, fully local behavior so the observatory always
  feels full with no network.
*/
import * as mock from './mockGenLayer.js'
import {
  CONTRACT_ADDRESS,
  EXPLORER,
  FAUCET,
  DEPLOY_TX,
  IS_DEPLOYED,
  fetchStats,
  fetchRelics,
  makeWalletClient,
  writeAnalyze,
  pollUntilDecided,
  capInputs
} from './realGenLayer.js'
import { getActiveAccount, hasProvider } from './wallet.js'
import { buildRelic } from '../utils/relicBuilder.js'
import { severityRank } from '../utils/formatters.js'

export { CONTRACT_ADDRESS, EXPLORER, FAUCET, DEPLOY_TX, IS_DEPLOYED }

// ---- mode ----------------------------------------------------------------

let mode = 'live' // 'live' | 'mock'. Default is live.

export function setGenLayerMode(next) {
  mode = next === 'mock' ? 'mock' : 'live'
}

export function getGenLayerMode() {
  return mode
}

// Back compat helpers. Older code spoke in a boolean "mock" flag.
export function setGenLayerMockMode(enabled) {
  mode = enabled ? 'mock' : 'live'
}

export function isGenLayerMockMode() {
  return mode === 'mock'
}

// ---- error mapping -------------------------------------------------------

// Translate raw chain/provider errors into calm, human messages.
export function describeGenLayerError(err) {
  const msg = String((err && err.message) || err || '')
  if (/reject|denied|4001|cancel/i.test(msg)) {
    return 'You cancelled the signature'
  }
  if (/LackOfFundForMaxFee|insufficient funds|max fee|fee reserve/i.test(msg)) {
    return 'Your wallet is below the fee reserve for AI transactions (mostly refunded). Top up at testnet-faucet.genlayer.foundation'
  }
  if (/rate limit|429|timeout|network|fetch|too many|congest/i.test(msg)) {
    return 'The network is congested, your authority map is still being notarized'
  }
  if (/not deployed/i.test(msg)) {
    return 'The Orbitarium contract is not deployed to this network yet'
  }
  if (msg.startsWith('[EXPECTED]')) {
    return msg.replace('[EXPECTED]', '').trim()
  }
  return msg || 'Something interrupted the analysis. Please try again'
}

// ---- on-chain relic -> Orbitarium authority relic ------------------------

// Map chain issue severities (Title case) into the lowercase convention the
// local engines and UI already use, and sort by severity.
function mapChainIssues(issues) {
  return (issues || [])
    .map((it) => ({
      name: it.name || '',
      severity: String(it.severity || 'medium').toLowerCase(),
      reason: it.reason || '',
      suggestion: it.suggestion || ''
    }))
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
}

// Build the Orbitarium authority relic from an authoritative on-chain relic.
// The visual structure (mini orbital map, main roles, critical powers,
// constraints) is built locally from the system so playback stays faithful; the
// five metrics, risk class, issues and summary are carried from chain, and the
// proof is the real chain proof.
export function toAuthorityRelic(onchain, options = {}) {
  const system = options.system || {}
  const txHash = options.txHash || null

  const base = buildRelic(system)
  const issues = mapChainIssues(onchain.issues)
  const explorerUrl = txHash
    ? `${EXPLORER}/tx/${txHash}`
    : `${EXPLORER}/address/${CONTRACT_ADDRESS}`

  const proof = {
    network: 'genlayer-bradbury',
    verified: true,
    txHash: txHash || null,
    contract: CONTRACT_ADDRESS,
    consensus: 'accepted',
    explorerUrl
  }

  return {
    ...base,
    metrics: {
      authorityStability: onchain.authorityStability,
      centralizationGravity: onchain.centralizationGravity,
      communityDistance: onchain.communityDistance,
      safeguardCoverage: onchain.safeguardCoverage,
      emergencyRisk: onchain.emergencyRisk
    },
    riskClass: onchain.riskClass,
    summary: onchain.summary || '',
    detectedIssues: issues,
    topIssue: issues[0] || null,
    onChainId: onchain.id,
    author: onchain.author || '',
    systemHash: onchain.systemHash || base.seal,
    verified: true,
    txHash: txHash || null,
    contract: CONTRACT_ADDRESS,
    explorerUrl,
    proof,
    // The RelicSeal badge reads mockProof; carry the real proof through it.
    mockProof: proof
  }
}

// ---- createAuthorityRecord -----------------------------------------------

// System creation stays LOCAL and instant in both modes. register_system exists
// on-chain as an optional deterministic registration, but Orbitarium never makes
// a slow Bradbury transaction just to create a system; the meaningful on-chain
// action is the AI consensus analyze, performed when sealing a relic.
export async function createAuthorityRecord(system) {
  return mock.createAuthorityRecord(system)
}

// ---- analyzeAuthorityTopology --------------------------------------------

// In mock mode this is the original instant local path: it produces the sealed
// Authority Relic from the local engines. In live mode this is the real Bradbury
// flow, driven through the onStage callback:
//   'wallet' -> 'submitted'(hash) -> 'consensus'(status + peeked draft)
//             -> 'confirmed'(relic) | 'error'(message)
export async function analyzeAuthorityTopology(system, options = {}) {
  const onStage = typeof options.onStage === 'function' ? options.onStage : () => {}

  if (mode === 'mock') {
    // Keep the instant local engine. A small simulated delay for feel.
    await mock.analyzeAuthorityTopology(system).catch(() => null)
    const relic = buildRelic(system)
    onStage('confirmed', { relic })
    return relic
  }

  // Live mode.
  if (!IS_DEPLOYED) {
    onStage('error', { message: describeGenLayerError(new Error('not deployed')) })
    throw new Error('The Orbitarium contract is not deployed to this network yet')
  }
  const account = getActiveAccount()
  if (!account) {
    const message = hasProvider()
      ? 'Connect your wallet to notarize this authority map on chain'
      : 'No wallet detected. Install MetaMask to map authority on chain, or switch to mock mode'
    onStage('error', { message })
    throw new Error(message)
  }

  try {
    onStage('wallet', {})
    const { protocolName, systemJson } = capInputs(system)
    const client = makeWalletClient(account)

    const hash = await writeAnalyze(client, protocolName, systemJson)
    onStage('submitted', { txHash: hash, explorerUrl: `${EXPLORER}/tx/${hash}` })

    const { status, draft } = await pollUntilDecided(client, hash, (liveStatus, peeked) => {
      onStage('consensus', { status: liveStatus, draft: peeked, txHash: hash })
    })

    if (status === 'ACCEPTED' || status === 'FINALIZED') {
      // Read the authoritative relic: newest by this author and protocol name.
      let chosen = null
      try {
        const recent = await fetchRelics(0)
        const lowerName = String(protocolName).toLowerCase()
        const lowerAuthor = String(account).toLowerCase()
        chosen =
          recent.find(
            (a) =>
              a.protocolName.toLowerCase() === lowerName &&
              a.author.toLowerCase() === lowerAuthor
          ) ||
          recent.find((a) => a.author.toLowerCase() === lowerAuthor) ||
          recent[0] ||
          null
      } catch (e) {
        /* fall back to the leader draft below */
      }

      let relic
      if (chosen) {
        relic = toAuthorityRelic(chosen, { system, txHash: hash })
      } else if (draft) {
        // Use the peeked draft as a graceful fallback if the read failed.
        relic = toAuthorityRelic(
          {
            id: 'relic',
            protocolName,
            author: account,
            systemHash: '',
            ...draft
          },
          { system, txHash: hash }
        )
      } else {
        throw new Error('The network is congested, your authority map is still being notarized')
      }
      onStage('confirmed', { relic, status, txHash: hash })
      return relic
    }

    // UNDETERMINED / CANCELED / TIMEOUT.
    const message =
      status === 'CANCELED'
        ? 'The analysis was cancelled on chain'
        : 'The network is congested, your authority map is still being notarized'
    onStage('error', { message, status, txHash: hash })
    throw new Error(message)
  } catch (err) {
    const message = describeGenLayerError(err)
    onStage('error', { message })
    throw new Error(message)
  }
}

// ---- registerAuthorityRelic ----------------------------------------------

// In live mode the analyze write already persisted the relic on chain, so this
// is a no-op that returns the relic with its real proof. In mock mode it keeps
// the original simulated registration.
export function registerAuthorityRelic(relic) {
  if (mode === 'mock') return mock.registerAuthorityRelic(relic)
  return Promise.resolve({
    status: 'finalized',
    verified: true,
    relicId: relic && (relic.onChainId || relic.systemId),
    txHash: relic && relic.txHash,
    contract: CONTRACT_ADDRESS,
    relic
  })
}

// ---- getMockProof --------------------------------------------------------

// Kept for API compatibility. Mock mode returns the simulated proof; live mode
// returns the real contract coordinates.
export function getMockProof(systemId) {
  if (mode === 'mock') return mock.getMockProof(systemId)
  return Promise.resolve({
    systemId,
    verified: true,
    contract: CONTRACT_ADDRESS,
    explorerUrl: `${EXPLORER}/address/${CONTRACT_ADDRESS}`
  })
}

// ---- getGenLayerStatus ---------------------------------------------------

export async function getGenLayerStatus() {
  if (mode === 'mock') {
    const status = await mock.getGenLayerStatus()
    return { ...status, mode: 'mock' }
  }
  const base = {
    mode: 'live',
    contract: CONTRACT_ADDRESS,
    explorer: EXPLORER,
    faucet: FAUCET,
    deployed: IS_DEPLOYED
  }
  if (!IS_DEPLOYED) {
    return { ...base, online: false, note: 'The Orbitarium contract is not deployed to this network yet.' }
  }
  try {
    const stats = await fetchStats()
    return { ...base, online: true, ...stats }
  } catch (e) {
    return {
      ...base,
      online: false,
      note: 'Bradbury is not reachable right now. Reads will retry.'
    }
  }
}

// ---- on-chain relic feed for the Vault -----------------------------------

// Fetch the most recent on-chain relics and shape them as verified capsules for
// the Vault of Systems. Returns [] when not live, not deployed or on any read
// failure, so the local collection is never disturbed.
export async function fetchChainRelics() {
  // The on-chain relic feed is a read-only public ledger of authority maps
  // notarized on Bradbury. It is independent of the analyze/write mode: even in
  // mock mode we still surface the real notarized maps, so the Vault and Void
  // always reflect on-chain reality. Only gate on deployment.
  if (!IS_DEPLOYED) return []
  try {
    const arr = await fetchRelics(0)
    return arr.map((r) => ({
      id: `chain:${r.id}`,
      onChainId: r.id,
      protocolName: r.protocolName,
      riskClass: r.riskClass,
      metrics: {
        authorityStability: r.authorityStability,
        centralizationGravity: r.centralizationGravity,
        communityDistance: r.communityDistance,
        safeguardCoverage: r.safeguardCoverage,
        emergencyRisk: r.emergencyRisk
      },
      issues: mapChainIssues(r.issues),
      summary: r.summary,
      author: r.author,
      created: r.created,
      systemHash: r.systemHash,
      onChain: true,
      verified: true,
      contract: CONTRACT_ADDRESS,
      explorerUrl: `${EXPLORER}/address/${CONTRACT_ADDRESS}`
    }))
  } catch (e) {
    return []
  }
}
