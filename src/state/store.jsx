/*
  store.jsx
  Central app state with localStorage persistence. No backend.
  Holds settings, the mock wallet, the vault of systems and the working draft.
*/
import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { calculateAuthorityGravity } from '../utils/gravityEngine.js'
import { setGenLayerMode, fetchChainRelics } from '../genlayer/genlayerClient.js'
import { shortId } from '../utils/formatters.js'

const STORAGE_KEY = 'orbitarium.v2'

const DEFAULT_SETTINGS = {
  theme: 'dark',
  animationIntensity: 'high', // low | medium | high
  reducedMotion: false,
  visualDensity: 'comfortable' // compact | comfortable
}
// Orbitarium always runs against the live GenLayer Bradbury contract. There is
// no user facing mock toggle: reads and notarization always target the chain.

const DEFAULT_WALLET = { connected: false, address: null }

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

function seedVault() {
  // No fictitious demo systems: the Vault shows only real authority relics
  // notarized on GenLayer Bradbury (merged live from the contract) plus
  // whatever the current user seals on chain.
  return []
}

function emptyDraft() {
  return {
    systemId: shortId('sys'),
    protocolName: '',
    createdAt: new Date().toISOString(),
    core: null,
    roles: [],
    powers: [],
    constraints: []
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const initial = useRef(loadState())
  const [settings, setSettings] = useState(() => {
    const merged = { ...DEFAULT_SETTINGS, ...(initial.current?.settings || {}) }
    // Drop any legacy mock toggle persisted from older builds: live only.
    delete merged.genlayerMode
    return merged
  })
  const [wallet, setWallet] = useState(initial.current?.wallet || DEFAULT_WALLET)
  const [systems, setSystems] = useState(() => initial.current?.systems || seedVault())
  const [draft, setDraft] = useState(() => initial.current?.draft || emptyDraft())
  const [seeded, setSeeded] = useState(initial.current?.seeded ?? false)
  const [chainRelics, setChainRelics] = useState([])
  const [chainLoading, setChainLoading] = useState(true)

  // First run: ensure vault is seeded.
  useEffect(() => {
    if (!seeded) {
      if (!initial.current) {
        setSystems(seedVault())
      }
      setSeeded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist on any change.
  useEffect(() => {
    const payload = { settings, wallet, systems, draft, seeded }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (e) {
      // Storage may be unavailable; the app still runs in memory.
    }
  }, [settings, wallet, systems, draft, seeded])

  // Reflect theme + motion on the document.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('theme-dark', settings.theme === 'dark')
    root.classList.toggle('theme-light', settings.theme === 'light')
    document.body.classList.toggle('reduce-motion', settings.reducedMotion)
    setGenLayerMode('live')
  }, [settings])

  // Always fetch the on-chain relic feed (read-only public ledger) on load and
  // gently poll. These merge into the Vault as verified capsules; failures are
  // swallowed so local content is never disturbed.
  useEffect(() => {
    let cancelled = false
    let timer = null
    const retries = []
    const load = async () => {
      try {
        const relics = await fetchChainRelics()
        if (cancelled) return
        setChainRelics(relics)
        if (Array.isArray(relics) && relics.length > 0) setChainLoading(false)
      } catch (e) {
        if (!cancelled) setChainRelics([])
      }
    }
    setChainLoading(true)
    load()
    // Quick initial retries in case the first gen_call is rate-limited or slow:
    // the void and vault should not flash an empty state prematurely.
    retries.push(setTimeout(load, 6000))
    retries.push(setTimeout(load, 16000))
    // Hard cap: never spin forever; resolve loading after 20s regardless.
    retries.push(setTimeout(() => { if (!cancelled) setChainLoading(false) }, 20000))
    timer = setInterval(load, 90000)
    return () => {
      cancelled = true
      if (timer) clearInterval(timer)
      retries.forEach(clearTimeout)
    }
  }, [])

  const updateSettings = useCallback((patch) => {
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  const toggleTheme = useCallback(() => {
    setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
  }, [])

  const connectWallet = useCallback(() => {
    const hex = '0123456789ABCDEF'
    let mid = ''
    for (let i = 0; i < 3; i++) mid += hex[Math.floor(Math.random() * 16)]
    let tail = ''
    for (let i = 0; i < 4; i++) tail += hex[Math.floor(Math.random() * 16)]
    setWallet({ connected: true, address: `0x7A4${mid}...${tail}` })
  }, [])

  const disconnectWallet = useCallback(() => setWallet(DEFAULT_WALLET), [])

  const saveSystem = useCallback((system) => {
    const stamped = {
      ...system,
      systemId: system.systemId || shortId('sys'),
      savedAt: new Date().toISOString()
    }
    setSystems((list) => {
      const idx = list.findIndex((s) => s.systemId === stamped.systemId)
      if (idx >= 0) {
        const copy = [...list]
        copy[idx] = stamped
        return copy
      }
      return [stamped, ...list]
    })
    return stamped
  }, [])

  const deleteSystem = useCallback((systemId) => {
    setSystems((list) => list.filter((s) => s.systemId !== systemId))
  }, [])

  const duplicateSystem = useCallback((systemId) => {
    setSystems((list) => {
      const src = list.find((s) => s.systemId === systemId)
      if (!src) return list
      const copy = JSON.parse(JSON.stringify(src))
      copy.systemId = shortId('sys')
      copy.protocolName = `${src.protocolName} (Copy)`
      copy.savedAt = new Date().toISOString()
      return [copy, ...list]
    })
  }, [])

  const importSystem = useCallback((system) => {
    const incoming = JSON.parse(JSON.stringify(system))
    incoming.systemId = system.systemId || shortId('sys')
    incoming.importedAt = new Date().toISOString()
    setSystems((list) => {
      const exists = list.some((s) => s.systemId === incoming.systemId)
      if (exists) incoming.systemId = shortId('sys')
      return [incoming, ...list]
    })
    return incoming
  }, [])

  const loadIntoDraft = useCallback((system) => {
    setDraft(JSON.parse(JSON.stringify(system)))
  }, [])

  const resetDraft = useCallback(() => setDraft(emptyDraft()), [])

  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      // ignore
    }
    setSettings(DEFAULT_SETTINGS)
    setWallet(DEFAULT_WALLET)
    setSystems(seedVault())
    setDraft(emptyDraft())
    setSeeded(true)
  }, [])

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      toggleTheme,
      wallet,
      connectWallet,
      disconnectWallet,
      systems,
      saveSystem,
      deleteSystem,
      duplicateSystem,
      importSystem,
      chainRelics,
      chainLoading,
      draft,
      setDraft,
      loadIntoDraft,
      resetDraft,
      clearStorage
    }),
    [settings, updateSettings, toggleTheme, wallet, connectWallet, disconnectWallet, systems, saveSystem, deleteSystem, duplicateSystem, importSystem, chainRelics, chainLoading, draft, loadIntoDraft, resetDraft, clearStorage]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

// Convenience: metrics for a system with light memo-by-reference.
export function useSystemMetrics(system) {
  return useMemo(() => (system ? calculateAuthorityGravity(system) : null), [system])
}
