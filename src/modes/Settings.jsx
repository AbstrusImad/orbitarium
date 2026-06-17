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
import { useWallet, shortAddress } from '../genlayer/wallet.js'

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
  const { settings, updateSettings, systems, importSystem, clearStorage } = useStore()
  const { push } = useToast()
  const wallet = useWallet()

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
          <Row title="GenLayer mode" hint="Live runs real AI consensus on the GenLayer Bradbury testnet (a connected wallet is required to seal a relic). Mock simulates the on-chain flow locally with no network.">
            <Choice value={settings.genlayerMode || 'live'} onChange={(v) => updateSettings({ genlayerMode: v })} options={[['live', 'Live'], ['mock', 'Mock']]} />
          </Row>
          <Row title="Wallet" hint={wallet.address ? `Connected as ${shortAddress(wallet.address)}${wallet.onChain ? ' on Bradbury' : ' (wrong network)'}` : 'Connect from the top bar to seal relics on chain'}>
            <button
              onClick={() => {
                if (wallet.address) {
                  wallet.disconnect()
                  push('Wallet disconnected', 'ember')
                } else {
                  push('Use Connect Wallet in the top bar', 'champagne')
                }
              }}
              className="rounded-lg px-3 py-2 text-xs hairline text-bone2"
              style={{ background: 'var(--ink2)' }}
            >
              {wallet.address ? 'Disconnect' : 'Wallet'}
            </button>
          </Row>
          <Row title="Systems data" hint="Export every saved system, or import a system JSON.">
            <ImportExportPanel onImport={(s) => { importSystem(s) }} exportData={systems} exportName="orbitarium-all-systems.json" label="All systems" />
          </Row>
          <Row title="Clear local storage" hint="Removes saved systems and settings. Real on-chain relics still load from the contract.">
            <button
              onClick={() => { clearStorage(); push('Local storage cleared', 'crimson') }}
              className="rounded-lg px-3 py-2 text-xs hairline text-crimson"
              style={{ background: 'var(--ink2)' }}
            >
              Clear storage
            </button>
          </Row>

          <div className="mt-8 mono text-[10px] text-mute leading-relaxed">
            Orbitarium reads the live GenLayer Bradbury contract and notarizes authority assessments through AI consensus. Mock mode keeps the full experience locally with no network. Systems and settings persist in localStorage.
          </div>
        </div>
      </div>
    </div>
  )
}
