from fastapi import APIRouter
from app.security import (
    encrypt_and_verify_aes,
    decrypt_and_verify_aes,
    verify_hmac_request
)
from app.soc_store import log_event
import time

router = APIRouter()

@router.post("/attack-simulate")
def simulate_attack(attack_type: str):
    try:
        # ===============================
        # AES TAMPERING ATTACK
        # ===============================
        if attack_type == "aes_tamper":
            enc = encrypt_and_verify_aes("secret-data")

            # 🔥 Tamper ciphertext
            bad_ciphertext = enc["ciphertext"][:-2] + "ff"

            decrypt_and_verify_aes(
                bad_ciphertext,
                enc["nonce"]
            )

        # ===============================
        # HMAC REPLAY ATTACK
        # ===============================
        elif attack_type == "replay":
            payload = {
                "action": "ADMIN",
                "user_id": "1",
                "resource": "secure",
                "nonce": "fixednonce123",
                "timestamp": str(int(time.time())),
                "signature": "fake"
            }

            # First request (accepted)
            try:
                verify_hmac_request(**payload)
            except:
                pass

            # Replay (must fail)
            verify_hmac_request(**payload)

        # ===============================
        # STALE TIMESTAMP
        # ===============================
        elif attack_type == "stale":
            verify_hmac_request(
                "ADMIN",
                "1",
                "secure",
                "nonce123",
                str(int(time.time()) - 999),
                "fake"
            )

        return {"detected": False}

    except Exception as e:
        log_event(
            event_type="ATTACK_BLOCKED",
            message=str(e),
            meta={
                "attack": attack_type,
                "level": "danger"
            }
        )

        return {
            "detected": True,
            "attack": attack_type,
            "reason": str(e)
        }
