/*
  store.jsx
  Central app state with localStorage persistence. No backend.
  Holds settings, the mock wallet, the vault of systems and the working draft.
*/
import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { DEMO_SYSTEMS } from '../data/demoSystems.js'
import { calculateAuthorityGravity } from '../utils/gravityEngine.js'
import { setGenLayerMockMode } from '../genlayer/genlayerClient.js'
import { shortId } from '../utils/formatters.js'

const STORAGE_KEY = 'orbitarium.v1'

const DEFAULT_SETTINGS = {
  theme: 'dark',
  animationIntensity: 'high', // low | medium | high
  reducedMotion: false,
  visualDensity: 'comfortable', // compact | comfortable
  genlayerMock: true
}

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
  // Deep clone the demo systems so edits never mutate the source.
  return DEMO_SYSTEMS.map((s) => JSON.parse(JSON.stringify(s)))
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
  const [settings, setSettings] = useState(initial.current?.settings || DEFAULT_SETTINGS)
  const [wallet, setWallet] = useState(initial.current?.wallet || DEFAULT_WALLET)
  const [systems, setSystems] = useState(() => initial.current?.systems || seedVault())
  const [draft, setDraft] = useState(() => initial.current?.draft || emptyDraft())
  const [seeded, setSeeded] = useState(initial.current?.seeded ?? false)

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
    setGenLayerMockMode(settings.genlayerMock)
  }, [settings])

  const updateSettings = useCallback((patch) => {
    setSettings((s) => ({ ...s, ...patch }))
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
      wallet,
      connectWallet,
      disconnectWallet,
      systems,
      saveSystem,
      deleteSystem,
      duplicateSystem,
      importSystem,
      draft,
      setDraft,
      loadIntoDraft,
      resetDraft,
      clearStorage
    }),
    [settings, updateSettings, wallet, connectWallet, disconnectWallet, systems, saveSystem, deleteSystem, duplicateSystem, importSystem, draft, loadIntoDraft, resetDraft, clearStorage]
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
