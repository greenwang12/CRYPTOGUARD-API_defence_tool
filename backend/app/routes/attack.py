from fastapi import APIRouter
from app.soc_store import log_event

router = APIRouter()

@router.post("/attack-simulate")
def attack_simulate(attack_type: str):

    if attack_type == "replay":
        log_event(
            event_type="REPLAY_ATTACK_DETECTED",
            message="Replay attack simulated (nonce reuse)",
            meta={
                "module": "attack",
                "level": "danger"
            }
        )

        return {
            "attack": "Replay Attack",
            "detected": True,
            "reason": "Request blocked (nonce reuse detected)"
        }

    if attack_type == "tamper":
        log_event(
            event_type="HMAC_TAMPER_DETECTED",
            message="Payload tampering attack simulated",
            meta={
                "module": "attack",
                "level": "danger"
            }
        )

        return {
            "attack": "Payload Tampering",
            "detected": True,
            "reason": "Request blocked (HMAC mismatch)"
        }

    return {
        "detected": False,
        "reason": "Unknown attack type"
    }
