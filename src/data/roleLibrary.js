/*
  roleLibrary.js
  Catalog of governance roles, each rendered as an orbital body.
  authorityWeight: baseline mass of the role (0-100).
  orbitDistance: default distance from the protocol core (0-100, larger is farther).
  visibility: how transparent the role is to the community.
*/
export const ROLE_LIBRARY = [
  { key: 'core-team', name: 'Core Team', authorityWeight: 82, orbitDistance: 22, visibility: 'internal', tone: 'crimson', hint: 'Founding operators with broad reach.' },
  { key: 'delegates', name: 'Delegates', authorityWeight: 48, orbitDistance: 46, visibility: 'public', tone: 'sage', hint: 'Elected voters representing holders.' },
  { key: 'guardians', name: 'Guardians', authorityWeight: 66, orbitDistance: 30, visibility: 'restricted', tone: 'ember', hint: 'Emergency responders with pause rights.' },
  { key: 'treasury-council', name: 'Treasury Council', authorityWeight: 70, orbitDistance: 34, visibility: 'restricted', tone: 'crimson', hint: 'Controls movement of protocol funds.' },
  { key: 'community', name: 'Community', authorityWeight: 28, orbitDistance: 72, visibility: 'public', tone: 'champagne', hint: 'Token holders and participants at large.' },
  { key: 'builders', name: 'Builders', authorityWeight: 40, orbitDistance: 52, visibility: 'public', tone: 'sage', hint: 'Contributors shipping protocol modules.' },
  { key: 'security-council', name: 'Security Council', authorityWeight: 74, orbitDistance: 28, visibility: 'restricted', tone: 'crimson', hint: 'High-trust signers for critical actions.' },
  { key: 'multisig-signers', name: 'Multisig Signers', authorityWeight: 60, orbitDistance: 36, visibility: 'restricted', tone: 'ember', hint: 'Key holders for shared custody.' },
  { key: 'foundation', name: 'Foundation', authorityWeight: 64, orbitDistance: 32, visibility: 'restricted', tone: 'ember', hint: 'Stewards of long-term mandate.' },
  { key: 'validators', name: 'Validators', authorityWeight: 52, orbitDistance: 44, visibility: 'public', tone: 'sage', hint: 'Operators securing consensus.' },
  { key: 'contributors', name: 'Contributors', authorityWeight: 34, orbitDistance: 58, visibility: 'public', tone: 'champagne', hint: 'Part-time and grant-funded workers.' },
  { key: 'emergency-operators', name: 'Emergency Operators', authorityWeight: 68, orbitDistance: 26, visibility: 'restricted', tone: 'crimson', hint: 'Triggers for fast incident response.' },
  { key: 'reviewers', name: 'Reviewers', authorityWeight: 38, orbitDistance: 50, visibility: 'public', tone: 'champagne', hint: 'Independent check on proposals.' },
  { key: 'auditors', name: 'Auditors', authorityWeight: 44, orbitDistance: 48, visibility: 'public', tone: 'sage', hint: 'External verification of code and funds.' }
]

export function roleByKey(key) {
  return ROLE_LIBRARY.find((r) => r.key === key) || null
}

export function roleByName(name) {
  return ROLE_LIBRARY.find((r) => r.name === name) || null
}
