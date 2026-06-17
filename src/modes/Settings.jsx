/*
  Settings.jsx
  Theme, animation intensity, reduced motion, visual density, GenLayer mock
  mode, wallet reset, data export/import and clear storage.
*/
import React from 'react'
import ModeHeader from '../components/layout/ModeHeader.jsx'
import ReducedMotionToggle from '../components/shared/ReducedMotionToggle.jsx'
import ImportExportPanel from '../components/shared/ImportExportPanel.jsx'
import { useStore } from '../state/store.jsx'
import { useToast } from '../components/shared/Toast.jsx'

function Row({ title, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 border-b" style={{ borderColor: 'var(--line1)' }}>
      <div>
        <div className="text-sm text-bone">{title}</div>
        {hint && <div className="text-xs text-ash mt-0.5 max-w-md">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Choice({ value, options, onChange }) {
  return (
    <div className="flex rounded-lg hairline overflow-hidden">
      {options.map(([val, lbl]) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          className="px-3 py-1.5 text-xs capitalize"
          style={{ background: value === val ? 'var(--ink4)' : 'transparent', color: value === val ? 'var(--bone)' : 'var(--ash)' }}
        >
          {lbl}
        </button>
      ))}
    </div>
  )
}

export default function Settings() {
  const { settings, updateSettings, systems, importSystem, clearStorage, wallet, disconnectWallet } = useStore()
  const { push } = useToast()

  return (
    <div className="h-full flex flex-col">
      <ModeHeader kicker="Settings" title="Instrument Settings" hint="Tune the observatory. Everything stays local in your browser." />
      <div className="flex-1 overflow-auto px-6 pb-10">
        <div className="max-w-2xl">
          <Row title="Theme" hint="Dark is the default. Light stays elegant.">
            <Choice value={settings.theme} onChange={(v) => updateSettings({ theme: v })} options={[['dark', 'Dark'], ['light', 'Light']]} />
          </Row>
          <Row title="Animation intensity" hint="How lively the orbital motion feels.">
            <Choice value={settings.animationIntensity} onChange={(v) => updateSettings({ animationIntensity: v })} options={[['low', 'Low'], ['medium', 'Medium'], ['high', 'High']]} />
          </Row>
          <Row title="Reduced motion" hint="Pauses non-essential animation. The OS preference is also respected.">
            <ReducedMotionToggle checked={settings.reducedMotion} onChange={(v) => updateSettings({ reducedMotion: v })} />
          </Row>
          <Row title="Visual density" hint="Compact tightens spacing across panels.">
            <Choice value={settings.visualDensity} onChange={(v) => updateSettings({ visualDensity: v })} options={[['comfortable', 'Comfortable'], ['compact', 'Compact']]} />
          </Row>
          <Row title="GenLayer mock mode" hint="Simulates an on-chain authority registry locally. No network calls.">
            <ReducedMotionToggle checked={settings.genlayerMock} onChange={(v) => updateSettings({ genlayerMock: v })} />
          </Row>
          <Row title="Mock wallet" hint={wallet.connected ? `Connected as ${wallet.address}` : 'Not connected'}>
            <button
              onClick={() => { disconnectWallet(); push('Wallet reset', 'ember') }}
              className="rounded-lg px-3 py-2 text-xs hairline text-bone2"
              style={{ background: 'var(--ink2)' }}
            >
              Reset wallet
            </button>
          </Row>
          <Row title="Systems data" hint="Export every saved system, or import a system JSON.">
            <ImportExportPanel onImport={(s) => { importSystem(s) }} exportData={systems} exportName="orbitarium-all-systems.json" label="All systems" />
          </Row>
          <Row title="Clear local storage" hint="Removes saved systems and settings, then reseeds the demo systems.">
            <button
              onClick={() => { clearStorage(); push('Local storage cleared and reseeded', 'crimson') }}
              className="rounded-lg px-3 py-2 text-xs hairline text-crimson"
              style={{ background: 'var(--ink2)' }}
            >
              Clear storage
            </button>
          </Row>

          <div className="mt-8 mono text-[10px] text-mute leading-relaxed">
            Orbitarium runs fully in your browser. No backend, no external APIs, no network calls. Systems and settings persist in localStorage.
          </div>
        </div>
      </div>
    </div>
  )
}
