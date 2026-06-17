/*
  App.jsx
  Routes between the Void Entry and the instrument modes. Mode changes animate
  like an orbital lens swap.
*/
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { StoreProvider } from './state/store.jsx'
import { ToastProvider } from './components/shared/Toast.jsx'
import OrbitalShell from './components/layout/OrbitalShell.jsx'
import VoidEntry from './modes/VoidEntry.jsx'
import OrbitCanvas from './modes/OrbitCanvas.jsx'
import PowerBodies from './modes/PowerBodies.jsx'
import ConstraintForge from './modes/ConstraintForge.jsx'
import GravityLens from './modes/GravityLens.jsx'
import StabilityMotion from './modes/StabilityMotion.jsx'
import AuthorityRelic from './modes/AuthorityRelic.jsx'
import VaultOfSystems from './modes/VaultOfSystems.jsx'
import Settings from './modes/Settings.jsx'

const MODE_COMPONENTS = {
  canvas: OrbitCanvas,
  bodies: PowerBodies,
  forge: ConstraintForge,
  lens: GravityLens,
  motion: StabilityMotion,
  relic: AuthorityRelic,
  vault: VaultOfSystems,
  settings: Settings
}

function Instrument() {
  const [mode, setMode] = useState('void')

  if (mode === 'void') {
    return <VoidEntry onEnter={(m) => setMode(m)} />
  }

  const ModeComp = MODE_COMPONENTS[mode] || OrbitCanvas

  return (
    <OrbitalShell mode={mode} onChange={setMode}>
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.985, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.01, filter: 'blur(4px)' }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
          className="h-full"
        >
          <ModeComp
            onOpenSystem={() => setMode('canvas')}
          />
        </motion.div>
      </AnimatePresence>
    </OrbitalShell>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <Instrument />
      </ToastProvider>
    </StoreProvider>
  )
}
