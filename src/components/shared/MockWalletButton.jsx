/*
  MockWalletButton.jsx
  Local-only wallet control. Reads "Connect Wallet" when disconnected and shows
  a fake address with a disconnect action when connected. No real wallet.
*/
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../state/store.jsx'

export default function MockWalletButton() {
  const { wallet, connectWallet, disconnectWallet } = useStore()
  const [open, setOpen] = useState(false)

  if (!wallet.connected) {
    return (
      <button
        onClick={connectWallet}
        className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium hairline transition-colors"
        style={{ background: 'var(--ink2)', color: 'var(--bone)' }}
      >
        <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: 'var(--ash)' }} />
        Connect Wallet
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium hairline"
        style={{ background: 'var(--ink2)', color: 'var(--bone)', borderColor: 'var(--sage)' }}
      >
        <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: 'var(--sage)', boxShadow: '0 0 8px var(--sage)' }} />
        <span className="mono">{wallet.address}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 mt-2 w-44 glass rounded-xl p-2 z-50"
          >
            <div className="px-2 py-1.5 mono text-[10px] text-ash uppercase">Connected (mock)</div>
            <button
              onClick={() => {
                disconnectWallet()
                setOpen(false)
              }}
              className="w-full text-left rounded-lg px-2 py-1.5 text-xs text-bone2 hover:text-crimson"
              style={{ background: 'transparent' }}
            >
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
