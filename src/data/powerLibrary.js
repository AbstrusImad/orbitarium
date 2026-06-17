/*
  powerLibrary.js
  Catalog of powers, rendered as comets / authority routes between bodies.
  riskLevel: normal | sensitive | emergency
  reversibility: reversible | partial | irreversible
  scope: narrow | moderate | broad
  defaultCooldown: hours of delay baked into the power (0 = none)
  reviewRequired: whether a review is expected for safe operation
  treasury: touches protocol funds
  critical: belongs to the trio that, when concentrated, defines capture risk
*/
export const POWER_LIBRARY = [
  { key: 'pause-protocol', name: 'Pause Protocol', riskLevel: 'emergency', reversibility: 'reversible', scope: 'broad', defaultCooldown: 0, reviewRequired: true, treasury: false, critical: true, hint: 'Halts protocol operations instantly.' },
  { key: 'move-treasury', name: 'Move Treasury', riskLevel: 'sensitive', reversibility: 'irreversible', scope: 'broad', defaultCooldown: 0, reviewRequired: true, treasury: true, critical: true, hint: 'Transfers protocol-owned funds.' },
  { key: 'approve-grants', name: 'Approve Grants', riskLevel: 'sensitive', reversibility: 'partial', scope: 'moderate', defaultCooldown: 0, reviewRequired: true, treasury: true, critical: false, hint: 'Releases funds to recipients.' },
  { key: 'upgrade-contracts', name: 'Upgrade Contracts', riskLevel: 'emergency', reversibility: 'irreversible', scope: 'broad', defaultCooldown: 0, reviewRequired: true, treasury: false, critical: true, hint: 'Replaces protocol logic.' },
  { key: 'change-fees', name: 'Change Fees', riskLevel: 'sensitive', reversibility: 'reversible', scope: 'moderate', defaultCooldown: 0, reviewRequired: false, treasury: true, critical: false, hint: 'Adjusts protocol fee parameters.' },
  { key: 'add-validators', name: 'Add Validators', riskLevel: 'normal', reversibility: 'reversible', scope: 'moderate', defaultCooldown: 0, reviewRequired: false, treasury: false, critical: false, hint: 'Expands the validator set.' },
  { key: 'remove-validators', name: 'Remove Validators', riskLevel: 'sensitive', reversibility: 'partial', scope: 'moderate', defaultCooldown: 0, reviewRequired: true, treasury: false, critical: false, hint: 'Removes validators from the set.' },
  { key: 'veto-proposal', name: 'Veto Proposal', riskLevel: 'sensitive', reversibility: 'reversible', scope: 'broad', defaultCooldown: 0, reviewRequired: true, treasury: false, critical: false, hint: 'Blocks a passing proposal.' },
  { key: 'create-proposal', name: 'Create Proposal', riskLevel: 'normal', reversibility: 'reversible', scope: 'narrow', defaultCooldown: 0, reviewRequired: false, treasury: false, critical: false, hint: 'Submits a governance proposal.' },
  { key: 'execute-vote', name: 'Execute Vote', riskLevel: 'sensitive', reversibility: 'partial', scope: 'moderate', defaultCooldown: 0, reviewRequired: false, treasury: false, critical: false, hint: 'Enacts a passed vote on chain.' },
  { key: 'emergency-action', name: 'Emergency Action', riskLevel: 'emergency', reversibility: 'partial', scope: 'broad', defaultCooldown: 0, reviewRequired: true, treasury: false, critical: false, hint: 'Out-of-band intervention.' },
  { key: 'publish-roadmap', name: 'Publish Roadmap', riskLevel: 'normal', reversibility: 'reversible', scope: 'narrow', defaultCooldown: 0, reviewRequired: false, treasury: false, critical: false, hint: 'Announces planned direction.' },
  { key: 'modify-rewards', name: 'Modify Rewards', riskLevel: 'sensitive', reversibility: 'reversible', scope: 'moderate', defaultCooldown: 0, reviewRequired: false, treasury: true, critical: false, hint: 'Changes incentive distribution.' },
  { key: 'deploy-module', name: 'Deploy Module', riskLevel: 'sensitive', reversibility: 'partial', scope: 'moderate', defaultCooldown: 0, reviewRequired: true, treasury: false, critical: false, hint: 'Ships a new protocol component.' }
]

export function powerByKey(key) {
  return POWER_LIBRARY.find((p) => p.key === key) || null
}

export function powerByName(name) {
  return POWER_LIBRARY.find((p) => p.name === name) || null
}
