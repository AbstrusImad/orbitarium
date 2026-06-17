# Orbitarium

Map the gravity of power.

## Live

- App: https://orbitarium-emv.pages.dev/
- Contract (GenLayer Bradbury Testnet): `0xA877f907e6f48cb388C7e87b3FCC68C53C1AE0f3`
- Explorer: https://explorer-bradbury.genlayer.com/address/0xA877f907e6f48cb388C7e87b3FCC68C53C1AE0f3
- Deploy transaction: `0xdd411ecb9e5a3400059f7b9977203097c8fad37b99f2cd275b6069b12275b4ad`
- Repository: https://github.com/AbstrusImad/orbitarium
- Faucet (test GEN): https://testnet-faucet.genlayer.foundation/

Orbitarium runs live on GenLayer Bradbury. Sealing an Authority Relic is a real
on-chain consensus write: an authority-cartographer model reads the whole
topology and validators agree on the centralization gravity within a tolerance
band, binding the assessment to a content hash. The deployable Intelligent
Contract is `genlayer/contract.py`. Connect a wallet on Bradbury and claim test
GEN from the faucet to notarize a map on chain. Demo systems are still seeded so
the Vault feels full, and a mock mode remains in Settings as an offline fallback.

Orbitarium is an authority cartographer for DAOs, Web3 protocols, communities and governance systems. It turns the authority architecture of a protocol into a living orbital system, so hidden power becomes visible geometry. You do not fill a normal form. You design the gravity of power.

- Protocol core is the central star.
- Treasury is the resource core.
- Governance is the orbital decision field.
- Roles are planets.
- Powers are comets and authority routes.
- Safeguards are protective rings.
- Cooldowns are slow orbits.
- Multisig is a key constellation.
- Veto power is a dark moon.
- Community review is a protective belt.
- Emergency powers are unstable comets.
- Spending caps are containment fields.
- Sunset clauses are bodies that fade over time.

## The problem it solves

Governance documents describe who can do what, but they hide concentration. A single role that can pause the protocol, move the treasury and upgrade the contracts holds protocol-ending power, and that is hard to see in a list of permissions. Orbitarium makes concentration spatial: heavy roles bend the field, dangerous routes glow, and a distant community sits in a weak outer orbit. The shape of the system tells you where the risk is before you read a single clause.

## Why no APIs and no backend

Orbitarium is fully local by design. There is no backend, no external API, no network call, no data provider and no remote database. Everything runs in the browser:

- Procedural visuals with SVG and Canvas.
- Deterministic local engines for all scoring.
- localStorage for persistence.
- Local JSON export and import for portability.

This keeps the tool private, fast and fully reproducible. The same system always yields the same metrics.

## How the orbital authority map works

The map is a reusable renderer (`OrbitMap`) that places every body with pure polar math (`orbitLayout.js`):

- Each role sits at a radius derived from its orbit distance and an angle you can change by dragging.
- Role mass scales with authority weight, so powerful roles are visibly larger.
- Powers are drawn as comets on illuminated authority routes between the roles that hold them and the core.
- Constraints render as distinct forms: slow orbits, fading bodies, transparent rings, interceptors, key constellations, containment fields, closed gates and rotating orbits.
- A safeguard belt of fine particles around the core grows denser as review coverage rises.

You can pan, zoom, drag bodies to change their orbit, select any body to open a floating inspector, and edit weight, distance, visibility, risk and power assignments.

## How the local gravity engine works

`gravityEngine.js` computes five deterministic metrics from the system, each on a 0 to 100 scale:

- Authority stability.
- Centralization gravity.
- Community distance.
- Safeguard coverage.
- Emergency risk.

The rules are simple and explainable:

- A role with high authority weight and many critical powers raises centralization gravity.
- A community far from the core with low weight raises community distance.
- Emergency powers without a cooldown or expiry raise emergency risk.
- Treasury powers without review raise treasury exposure.
- Multisig, timelock and public review raise stability.
- One role that can Upgrade Contracts, Move Treasury and Pause Protocol is flagged as a critical issue.
- Sensitive powers with a sunset clause reduce risk.
- A community challenge window reduces governance capture risk.

`authorityEngine.js` wraps the gravity engine, detects issues with severity and suggestions, and attaches a mock proof. The coefficients are calibrated so the canonical ArcDAO demo maps to its documented metrics.

## How Stability Motion works

`stabilityEngine.js` builds a simulation model: each body gets a pull from its mass, a tremor from unconstrained dangerous powers, and a stabilization value from its constraints. Emergency powers become comets that cross the field, slowed when they carry a cooldown or expiry. The `StabilitySimulator` canvas animates this in real time, devicePixelRatio aware, pausing when the tab is hidden and respecting reduced motion. When the run ends, a compact result shows stability, centralization, community distance, safeguard coverage, emergency risk and a verdict of Synchronized, Wobbling or Breaking Orbit.

## How the GenLayer mock works

`genlayer/mockGenLayer.js` simulates an on-chain authority registry entirely in memory, with fake hashes, block heights, validator counts and simulated latency. `genlayer/genlayerClient.js` is a thin façade with a mock-mode flag you can toggle in Settings. When mock mode is off, the client returns a clearly labeled offline response rather than making any network call, which honors the no-API constraint.

`genlayer/orbitarium_contract.py` is a conceptual GenLayer Intelligent Contract. It is documented to show how validators would agree on deterministic numeric gravity values and decide categorical risk labels by majority. It is not called by the shipped product.

## Install and run locally

```
npm install
npm run dev
npm run build
```

- `npm run dev` starts the Vite dev server.
- `npm run build` produces a static site in `dist/` with `dist/index.html`.
- `npm run no-emoji` scans the source for emoji and the em dash character and fails if any are found.

## Demo systems

Five systems are seeded into the Vault on first run:

- ArcDAO Authority Map (the canonical demo).
- NovaSwap Emergency System.
- OrbitLend Treasury Controls.
- LumaMesh Validator Governance.
- FlowMarket Grant Authority.

ArcDAO is tuned to produce Authority Stability 67, Centralization Gravity 78, Community Distance 64, Safeguard Coverage 52 and Emergency Risk 71, with a main issue of Core Team Authority Mass because the Core Team holds the critical trio of Pause Protocol, Move Treasury and Upgrade Contracts.

## Export and import JSON

Any system can be exported as JSON from the Vault, the Relic mode or Settings, and imported back. The Vault export bundles every saved system. Imports are validated before they are added. Everything persists in localStorage, so a reload keeps your systems and settings. Settings includes a clear-storage action that reseeds the demo systems.

## Project structure

```
orbitarium/
  index.html
  vite.config.js
  tailwind.config.js
  postcss.config.js
  scripts/no-emoji.cjs
  public/_redirects
  genlayer/orbitarium_contract.py
  src/
    main.jsx
    App.jsx
    styles.css
    modes/            VoidEntry, OrbitCanvas, PowerBodies, ConstraintForge,
                      GravityLens, StabilityMotion, AuthorityRelic,
                      VaultOfSystems, Settings
    components/
      layout/         OrbitalShell, ModeSwitcher, ModeHeader, ModeIcons
      orbit/          OrbitMap, ProtocolCore, AuthorityBody, PowerComet,
                      OrbitRing, AuthorityRoute, SafeguardBelt,
                      FloatingInspector, orbitLayout
      constraints/    ConstraintRing
      gravity/        GravityField
      relic/          RelicSeal
      vault/          VaultCapsule
      shared/         RiskBadge, AuthorityMeter, CommunityDistanceMeter,
                      WeightDial, GenLayerProofBadge, MockWalletButton,
                      ImportExportPanel, ReducedMotionToggle, Toast,
                      EmptyState, RadialActionMenu, VoidEntryCore
      animations/     Starfield, StabilitySimulator
    data/             demoSystems, roleLibrary, powerLibrary, constraintLibrary
    utils/            authorityEngine, gravityEngine, stabilityEngine,
                      relicBuilder, exportImport, formatters
    genlayer/         genlayerClient, mockGenLayer
    state/            store, draftOps, useMotionPrefs
```

## Next steps

- Connect the conceptual GenLayer contract to a real node so relics can be anchored on chain.
- Add comparison mode to overlay two systems and diff their gravity.
- Add a timeline so sunset clauses and rotations can be scrubbed over time.
- Expand the issue detector with more governance capture patterns.
- Add shareable read-only relic links generated from local JSON.
