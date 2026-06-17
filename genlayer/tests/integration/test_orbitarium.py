import json
from pathlib import Path

from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded

RISK_CLASSES = ("Distributed", "Balanced", "Concentrated", "Centralized", "Critical")

# Target the deployable contract by path. The sibling orbitarium_contract.py is
# conceptual documentation, so loading by bare name would be ambiguous.
CONTRACT_PATH = Path(__file__).resolve().parents[2] / "contract.py"


def test_arcdao_authority_map_consensus():
    factory = get_contract_factory(contract_file_path=CONTRACT_PATH)
    contract = factory.deploy(args=[])

    system = json.dumps({
        "core": {"name": "ArcDAO Core", "type": "Protocol Core"},
        "roles": [
            {"name": "Core Team", "authorityWeight": 85},
            {"name": "Guardians", "authorityWeight": 60},
            {"name": "Treasury Council", "authorityWeight": 55},
            {"name": "Community", "authorityWeight": 38},
            {"name": "Delegates", "authorityWeight": 45},
        ],
        "powers": [
            {"name": "Pause Protocol", "risk": "High", "assignedTo": ["Core Team", "Guardians"]},
            {"name": "Move Treasury", "risk": "High", "assignedTo": ["Core Team", "Treasury Council"]},
            {"name": "Upgrade Contracts", "risk": "Critical", "assignedTo": ["Core Team"]},
            {"name": "Approve Grants", "risk": "Medium", "assignedTo": ["Treasury Council"]},
            {"name": "Veto Proposal", "risk": "High", "assignedTo": ["Guardians"]},
        ],
        "constraints": [
            {"name": "72h Cooldown", "type": "Cooldown", "appliesTo": ["Pause Protocol"]},
            {"name": "Public Review", "type": "Review", "appliesTo": ["Move Treasury"]},
            {"name": "3/5 Multisig", "type": "Multisig", "appliesTo": ["Move Treasury"]},
            {"name": "Community Challenge Window", "type": "Challenge", "appliesTo": ["Veto Proposal"]},
            {"name": "Sunset Clause", "type": "Sunset", "appliesTo": ["Pause Protocol"]},
        ],
    })

    # The AI consensus write. Validators anchor on centralizationGravity within a
    # generous tolerance band so a heterogeneous set reaches ACCEPTED.
    receipt = contract.analyze(args=["ArcDAO", system]).transact()
    assert tx_execution_succeeded(receipt)

    stats = contract.get_stats(args=[]).call()
    assert int(stats["analyses"]) == 1
    assert int(stats["relics"]) == 1

    listing = contract.get_relics(args=[0]).call()
    assert len(listing) == 1
    relic = listing[0]

    risk_class = relic["riskClass"]
    stability = int(relic["authorityStability"])
    gravity = int(relic["centralizationGravity"])
    distance = int(relic["communityDistance"])
    coverage = int(relic["safeguardCoverage"])
    emergency = int(relic["emergencyRisk"])

    assert risk_class in RISK_CLASSES
    assert 0 <= stability <= 100
    assert 0 <= gravity <= 100
    assert 0 <= distance <= 100
    assert 0 <= coverage <= 100
    assert 0 <= emergency <= 100

    # This map concentrates Upgrade Contracts, Move Treasury and Pause Protocol on
    # the high-weight Core Team, so centralization gravity should read high.
    # Asserted as a reasonable floor, not hard-pinned.
    assert gravity >= 55

    print(
        "OBSERVED riskClass={0} authorityStability={1} centralizationGravity={2} "
        "communityDistance={3} safeguardCoverage={4} emergencyRisk={5}".format(
            risk_class, stability, gravity, distance, coverage, emergency
        )
    )

    # The stored relic is retrievable by id and carries the agreed risk class.
    fetched = contract.get_relic(args=[relic["id"]]).call()
    assert fetched["riskClass"] == risk_class
