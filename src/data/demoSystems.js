/*
  demoSystems.js
  Seed orbital systems loaded into the Vault on first run.
  Each system uses the normalized schema consumed by the engines:
    roles:       { id, key, name, authorityWeight, orbitDistance, visibility, tone }
    powers:      { id, key, name, riskLevel, type, assignedTo:[roleId], reviewRequired, treasury, cooldown }
    constraints: { id, key, name, type, appliesTo:[powerId | 'emergency-class'] }
  The canonical "ArcDAO Authority Map" is tuned to produce the documented metrics.
*/

export const ARCDAO_SYSTEM = {
  systemId: 'demo-arcdao',
  protocolName: 'ArcDAO Authority Map',
  createdAt: '2024-01-01T00:00:00.000Z',
  core: { name: 'ArcDAO', type: 'protocol' },
  roles: [
    { id: 'r1', key: 'core-team', name: 'Core Team', authorityWeight: 82, orbitDistance: 22, visibility: 'internal', tone: 'crimson' },
    { id: 'r2', key: 'guardians', name: 'Guardians', authorityWeight: 66, orbitDistance: 30, visibility: 'restricted', tone: 'ember' },
    { id: 'r3', key: 'treasury-council', name: 'Treasury Council', authorityWeight: 70, orbitDistance: 34, visibility: 'restricted', tone: 'crimson' },
    { id: 'r4', key: 'community', name: 'Community', authorityWeight: 28, orbitDistance: 72, visibility: 'public', tone: 'champagne' },
    { id: 'r5', key: 'delegates', name: 'Delegates', authorityWeight: 48, orbitDistance: 46, visibility: 'public', tone: 'sage' }
  ],
  powers: [
    { id: 'p1', key: 'pause-protocol', name: 'Pause Protocol', riskLevel: 'emergency', type: 'control', assignedTo: ['r1', 'r2'], reviewRequired: true, treasury: false, cooldown: 72 },
    { id: 'p2', key: 'move-treasury', name: 'Move Treasury', riskLevel: 'sensitive', type: 'treasury', assignedTo: ['r1', 'r3'], reviewRequired: true, treasury: true, cooldown: 0 },
    { id: 'p3', key: 'upgrade-contracts', name: 'Upgrade Contracts', riskLevel: 'emergency', type: 'control', assignedTo: ['r1'], reviewRequired: true, treasury: false, cooldown: 0 },
    { id: 'p4', key: 'approve-grants', name: 'Approve Grants', riskLevel: 'sensitive', type: 'treasury', assignedTo: ['r3'], reviewRequired: true, treasury: true, cooldown: 0 },
    { id: 'p5', key: 'veto-proposal', name: 'Veto Proposal', riskLevel: 'sensitive', type: 'governance', assignedTo: ['r5'], reviewRequired: true, treasury: false, cooldown: 0 }
  ],
  constraints: [
    { id: 'c1', key: 'cooldown', name: '72h Cooldown on Pause Protocol', type: 'slow-orbit', appliesTo: ['p1'] },
    { id: 'c2', key: 'public-review', name: 'Public Review for Move Treasury', type: 'transparent-ring', appliesTo: ['p2'] },
    { id: 'c3', key: 'multisig', name: '3/5 Multisig for Treasury', type: 'key-constellation', appliesTo: ['p2'] },
    { id: 'c4', key: 'challenge-window', name: 'Community Challenge Window for Veto', type: 'interceptor', appliesTo: ['p5'] },
    { id: 'c5', key: 'sunset-clause', name: 'Sunset Clause for Emergency Powers', type: 'fading-body', appliesTo: ['emergency-class'] }
  ]
}

export const NOVASWAP_SYSTEM = {
  systemId: 'demo-novaswap',
  protocolName: 'NovaSwap Emergency System',
  createdAt: '2024-01-02T00:00:00.000Z',
  core: { name: 'NovaSwap', type: 'protocol' },
  roles: [
    { id: 'r1', key: 'security-council', name: 'Security Council', authorityWeight: 74, orbitDistance: 28, visibility: 'restricted', tone: 'crimson' },
    { id: 'r2', key: 'emergency-operators', name: 'Emergency Operators', authorityWeight: 68, orbitDistance: 26, visibility: 'restricted', tone: 'crimson' },
    { id: 'r3', key: 'guardians', name: 'Guardians', authorityWeight: 66, orbitDistance: 30, visibility: 'restricted', tone: 'ember' },
    { id: 'r4', key: 'community', name: 'Community', authorityWeight: 30, orbitDistance: 70, visibility: 'public', tone: 'champagne' }
  ],
  powers: [
    { id: 'p1', key: 'pause-protocol', name: 'Pause Protocol', riskLevel: 'emergency', type: 'control', assignedTo: ['r1', 'r2'], reviewRequired: true, treasury: false, cooldown: 0 },
    { id: 'p2', key: 'emergency-action', name: 'Emergency Action', riskLevel: 'emergency', type: 'control', assignedTo: ['r2'], reviewRequired: true, treasury: false, cooldown: 0 },
    { id: 'p3', key: 'upgrade-contracts', name: 'Upgrade Contracts', riskLevel: 'emergency', type: 'control', assignedTo: ['r1'], reviewRequired: true, treasury: false, cooldown: 0 }
  ],
  constraints: [
    { id: 'c1', key: 'multisig', name: 'Multisig for Pause', type: 'key-constellation', appliesTo: ['p1'] },
    { id: 'c2', key: 'emergency-expiry', name: 'Emergency Expiry', type: 'fading-body', appliesTo: ['emergency-class'] }
  ]
}

export const ORBITLEND_SYSTEM = {
  systemId: 'demo-orbitlend',
  protocolName: 'OrbitLend Treasury Controls',
  createdAt: '2024-01-03T00:00:00.000Z',
  core: { name: 'OrbitLend', type: 'protocol' },
  roles: [
    { id: 'r1', key: 'treasury-council', name: 'Treasury Council', authorityWeight: 70, orbitDistance: 34, visibility: 'restricted', tone: 'crimson' },
    { id: 'r2', key: 'multisig-signers', name: 'Multisig Signers', authorityWeight: 60, orbitDistance: 36, visibility: 'restricted', tone: 'ember' },
    { id: 'r3', key: 'reviewers', name: 'Reviewers', authorityWeight: 38, orbitDistance: 50, visibility: 'public', tone: 'champagne' },
    { id: 'r4', key: 'community', name: 'Community', authorityWeight: 34, orbitDistance: 64, visibility: 'public', tone: 'champagne' },
    { id: 'r5', key: 'delegates', name: 'Delegates', authorityWeight: 48, orbitDistance: 46, visibility: 'public', tone: 'sage' }
  ],
  powers: [
    { id: 'p1', key: 'move-treasury', name: 'Move Treasury', riskLevel: 'sensitive', type: 'treasury', assignedTo: ['r1', 'r2'], reviewRequired: true, treasury: true, cooldown: 0 },
    { id: 'p2', key: 'approve-grants', name: 'Approve Grants', riskLevel: 'sensitive', type: 'treasury', assignedTo: ['r1'], reviewRequired: true, treasury: true, cooldown: 0 },
    { id: 'p3', key: 'change-fees', name: 'Change Fees', riskLevel: 'sensitive', type: 'treasury', assignedTo: ['r5'], reviewRequired: false, treasury: true, cooldown: 0 }
  ],
  constraints: [
    { id: 'c1', key: 'multisig', name: '4/7 Multisig for Treasury', type: 'key-constellation', appliesTo: ['p1'] },
    { id: 'c2', key: 'public-review', name: 'Public Review for Grants', type: 'transparent-ring', appliesTo: ['p2'] },
    { id: 'c3', key: 'spending-cap', name: 'Spending Cap', type: 'containment-field', appliesTo: ['p1'] },
    { id: 'c4', key: 'execution-timelock', name: 'Execution Timelock', type: 'closed-gate', appliesTo: ['p1'] },
    { id: 'c5', key: 'independent-review', name: 'Independent Review for Fees', type: 'transparent-ring', appliesTo: ['p3'] }
  ]
}

export const LUMAMESH_SYSTEM = {
  systemId: 'demo-lumamesh',
  protocolName: 'LumaMesh Validator Governance',
  createdAt: '2024-01-04T00:00:00.000Z',
  core: { name: 'LumaMesh', type: 'protocol' },
  roles: [
    { id: 'r1', key: 'validators', name: 'Validators', authorityWeight: 52, orbitDistance: 44, visibility: 'public', tone: 'sage' },
    { id: 'r2', key: 'foundation', name: 'Foundation', authorityWeight: 64, orbitDistance: 32, visibility: 'restricted', tone: 'ember' },
    { id: 'r3', key: 'delegates', name: 'Delegates', authorityWeight: 48, orbitDistance: 46, visibility: 'public', tone: 'sage' },
    { id: 'r4', key: 'community', name: 'Community', authorityWeight: 40, orbitDistance: 58, visibility: 'public', tone: 'champagne' }
  ],
  powers: [
    { id: 'p1', key: 'add-validators', name: 'Add Validators', riskLevel: 'normal', type: 'consensus', assignedTo: ['r2'], reviewRequired: false, treasury: false, cooldown: 0 },
    { id: 'p2', key: 'remove-validators', name: 'Remove Validators', riskLevel: 'sensitive', type: 'consensus', assignedTo: ['r2', 'r3'], reviewRequired: true, treasury: false, cooldown: 0 },
    { id: 'p3', key: 'execute-vote', name: 'Execute Vote', riskLevel: 'sensitive', type: 'governance', assignedTo: ['r3'], reviewRequired: false, treasury: false, cooldown: 0 },
    { id: 'p4', key: 'create-proposal', name: 'Create Proposal', riskLevel: 'normal', type: 'governance', assignedTo: ['r1', 'r4'], reviewRequired: false, treasury: false, cooldown: 0 }
  ],
  constraints: [
    { id: 'c1', key: 'quorum', name: 'Quorum Requirement', type: 'mass-ring', appliesTo: ['p2', 'p3'] },
    { id: 'c2', key: 'vote-delay', name: 'Vote Delay', type: 'slow-orbit', appliesTo: ['p3'] },
    { id: 'c3', key: 'role-rotation', name: 'Validator Rotation', type: 'rotating-orbit', appliesTo: ['p2'] },
    { id: 'c4', key: 'challenge-window', name: 'Challenge Window', type: 'interceptor', appliesTo: ['p2'] }
  ]
}

export const FLOWMARKET_SYSTEM = {
  systemId: 'demo-flowmarket',
  protocolName: 'FlowMarket Grant Authority',
  createdAt: '2024-01-05T00:00:00.000Z',
  core: { name: 'FlowMarket', type: 'protocol' },
  roles: [
    { id: 'r1', key: 'foundation', name: 'Foundation', authorityWeight: 64, orbitDistance: 32, visibility: 'restricted', tone: 'ember' },
    { id: 'r2', key: 'reviewers', name: 'Reviewers', authorityWeight: 38, orbitDistance: 50, visibility: 'public', tone: 'champagne' },
    { id: 'r3', key: 'builders', name: 'Builders', authorityWeight: 40, orbitDistance: 52, visibility: 'public', tone: 'sage' },
    { id: 'r4', key: 'community', name: 'Community', authorityWeight: 42, orbitDistance: 54, visibility: 'public', tone: 'champagne' }
  ],
  powers: [
    { id: 'p1', key: 'approve-grants', name: 'Approve Grants', riskLevel: 'sensitive', type: 'treasury', assignedTo: ['r1'], reviewRequired: true, treasury: true, cooldown: 0 },
    { id: 'p2', key: 'modify-rewards', name: 'Modify Rewards', riskLevel: 'sensitive', type: 'treasury', assignedTo: ['r1', 'r3'], reviewRequired: false, treasury: true, cooldown: 0 },
    { id: 'p3', key: 'publish-roadmap', name: 'Publish Roadmap', riskLevel: 'normal', type: 'signal', assignedTo: ['r1'], reviewRequired: false, treasury: false, cooldown: 0 },
    { id: 'p4', key: 'create-proposal', name: 'Create Proposal', riskLevel: 'normal', type: 'governance', assignedTo: ['r3', 'r4'], reviewRequired: false, treasury: false, cooldown: 0 }
  ],
  constraints: [
    { id: 'c1', key: 'public-review', name: 'Public Review for Grants', type: 'transparent-ring', appliesTo: ['p1'] },
    { id: 'c2', key: 'spending-cap', name: 'Grant Spending Cap', type: 'containment-field', appliesTo: ['p1'] },
    { id: 'c3', key: 'transparency-notice', name: 'Transparency Notice', type: 'transparent-ring', appliesTo: ['p2'] },
    { id: 'c4', key: 'role-rotation', name: 'Reviewer Rotation', type: 'rotating-orbit', appliesTo: ['p1'] }
  ]
}

export const DEMO_SYSTEMS = [
  ARCDAO_SYSTEM,
  NOVASWAP_SYSTEM,
  ORBITLEND_SYSTEM,
  LUMAMESH_SYSTEM,
  FLOWMARKET_SYSTEM
]
