/*
  constraintLibrary.js
  Catalog of safeguards. Each has a distinct visual form and a mitigation
  profile used by the gravity engine.
  form: visual archetype used by the renderer.
  stabilizes: amount it contributes to safeguard coverage / stability.
  reducesEmergency: whether it tempers emergency risk.
  reducesCentralization: whether it counters concentration of power.
  addsReview: whether it adds a review gate.
*/
export const CONSTRAINT_LIBRARY = [
  { key: 'cooldown', name: 'Cooldown', form: 'slow-orbit', stabilizes: 12, reducesEmergency: true, reducesCentralization: false, addsReview: false, hint: 'Slows a dangerous move with a delay.' },
  { key: 'sunset-clause', name: 'Sunset Clause', form: 'fading-body', stabilizes: 10, reducesEmergency: true, reducesCentralization: true, addsReview: false, hint: 'Power expires after a set period.' },
  { key: 'public-review', name: 'Public Review', form: 'transparent-ring', stabilizes: 14, reducesEmergency: false, reducesCentralization: true, addsReview: true, hint: 'Exposes the action to public scrutiny.' },
  { key: 'challenge-window', name: 'Community Challenge Window', form: 'interceptor', stabilizes: 16, reducesEmergency: false, reducesCentralization: true, addsReview: true, hint: 'Community can intercept before execution.' },
  { key: 'multisig', name: 'Multisig Requirement', form: 'key-constellation', stabilizes: 15, reducesEmergency: true, reducesCentralization: true, addsReview: false, hint: 'Requires multiple keys to act.' },
  { key: 'spending-cap', name: 'Spending Cap', form: 'containment-field', stabilizes: 11, reducesEmergency: false, reducesCentralization: true, addsReview: false, hint: 'Caps the value moved per action.' },
  { key: 'vote-delay', name: 'Vote Delay', form: 'slow-orbit', stabilizes: 9, reducesEmergency: true, reducesCentralization: false, addsReview: false, hint: 'Delay between vote and execution.' },
  { key: 'quorum', name: 'Quorum Requirement', form: 'mass-ring', stabilizes: 12, reducesEmergency: false, reducesCentralization: true, addsReview: false, hint: 'Requires collective mass to pass.' },
  { key: 'role-rotation', name: 'Role Rotation', form: 'rotating-orbit', stabilizes: 10, reducesEmergency: false, reducesCentralization: true, addsReview: false, hint: 'Rotates the holders of a role.' },
  { key: 'independent-review', name: 'Independent Review', form: 'transparent-ring', stabilizes: 13, reducesEmergency: false, reducesCentralization: true, addsReview: true, hint: 'External party reviews the action.' },
  { key: 'execution-timelock', name: 'Execution Timelock', form: 'closed-gate', stabilizes: 14, reducesEmergency: true, reducesCentralization: false, addsReview: false, hint: 'Locks execution behind a timer.' },
  { key: 'transparency-notice', name: 'Transparency Notice', form: 'transparent-ring', stabilizes: 7, reducesEmergency: false, reducesCentralization: false, addsReview: true, hint: 'Publishes intent before action.' },
  { key: 'emergency-expiry', name: 'Emergency Expiry', form: 'fading-body', stabilizes: 12, reducesEmergency: true, reducesCentralization: true, addsReview: false, hint: 'Emergency power auto-expires.' },
  { key: 'scope-limit', name: 'Scope Limit', form: 'containment-field', stabilizes: 10, reducesEmergency: false, reducesCentralization: true, addsReview: false, hint: 'Restricts the reach of a power.' }
]

export function constraintByKey(key) {
  return CONSTRAINT_LIBRARY.find((c) => c.key === key) || null
}

export function constraintByName(name) {
  return CONSTRAINT_LIBRARY.find((c) => c.name === name) || null
}
