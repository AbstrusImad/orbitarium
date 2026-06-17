/*
  WalletButton.jsx
  The real Bradbury wallet control for the chrome. Reads "Connect Wallet" as a
  clearly labeled button when disconnected. When connected it shows the short
  address with a network indicator and a small panel to view the network, open
  the faucet and contract, switch to Bradbury or disconnect. With no injected
  provider it shows a calm "No wallet detected" state with a MetaMask link, and
  the app stays usable in mock mode.
*/
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWallet, shortAddress, METAMASK_URL } from '../../genlayer/wallet.js'
import { EXPLORER, FAUCET, CONTRACT_ADDRESS, IS_DEPLOYED } from '../../genlayer/genlayerClient.js'

export default function WalletButton() {
  const wallet = useWallet()
  const [open, setOpen] = useState(false)

  const connected = Boolean(wallet.address)
  const dotColor = !connected ? 'var(--ash)' : wallet.onChain ? 'var(--sage)' : 'var(--crimson)'

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (connected) {
            setOpen((o) => !o)
          } else if (wallet.hasProvider) {
            wallet.connect()
          } else {
            setOpen((o) => !o)
          }
        }}
        className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium hairline transition-colors"
        style={{
          background: 'var(--ink2)',
          color: 'var(--bone)',
          borderColor: connected ? dotColor : 'var(--line2)'
        }}
      >
        <span
          className="inline-block rounded-full"
          style={{ width: 7, height: 7, background: dotColor, boxShadow: connected ? `0 0 8px ${dotColor}` : 'none' }}
        />
        {connected ? <span className="mono">{shortAddress(wallet.address)}</span> : <span>Connect Wallet</span>}
      </button>

      <AnimatePresence>
        {open && connected && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 mt-2 w-64 glass rounded-xl p-3 z-50"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="mono text-sm text-bone">{shortAddress(wallet.address)}</span>
              <span
                className="mono text-[9px] uppercase tracking-wider px-2 py-1 rounded-full"
                style={{
                  color: wallet.onChain ? 'var(--sage)' : 'var(--crimson)',
                  background: 'var(--ink3)',
                  border: `1px solid ${wallet.onChain ? 'var(--sage)' : 'var(--crimson)'}`
                }}
              >
                {wallet.onChain ? 'Bradbury' : 'Wrong network'}
              </span>
            </div>

            {!wallet.onChain && (
              <button
                onClick={() => wallet.connect()}
                className="w-full rounded-lg py-1.5 text-[11px] font-medium mb-2"
                style={{ background: 'var(--sage)', color: 'var(--sage-ink)' }}
              >
                Switch to Bradbury
              </button>
            )}

            <div className="flex items-center gap-1.5 flex-wrap">
              <a
                href={FAUCET}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg px-2.5 py-1.5 text-[10px] hairline text-bone2"
                style={{ background: 'var(--ink2)' }}
              >
                Faucet
              </a>
              {IS_DEPLOYED && (
                <a
                  href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg px-2.5 py-1.5 text-[10px] hairline text-bone2"
                  style={{ background: 'var(--ink2)' }}
                >
                  Contract
                </a>
              )}
              <button
                onClick={() => {
                  wallet.disconnect()
                  setOpen(false)
                }}
                className="rounded-lg px-2.5 py-1.5 text-[10px] hairline text-crimson ml-auto"
                style={{ background: 'var(--ink2)' }}
              >
                Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && !connected && !wallet.hasProvider && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 mt-2 w-64 glass rounded-xl p-3 z-50"
          >
            <div className="text-sm text-bone">No wallet detected</div>
            <p className="text-xs text-ash mt-1 leading-snug">
              Install MetaMask to map authority on chain. The observatory stays fully usable in mock mode.
            </p>
            <a
              href={METAMASK_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-3 rounded-lg px-3 py-1.5 text-[11px] font-medium"
              style={{ background: 'var(--sage)', color: 'var(--sage-ink)' }}
            >
              Get MetaMask
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
