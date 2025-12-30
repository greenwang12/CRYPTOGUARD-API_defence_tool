from fastapi import APIRouter, HTTPException
from app.security import encrypt_and_verify_aes, decrypt_and_verify_aes
from app.soc_store import log_event

router = APIRouter()

# ===============================
# ENCRYPT
# ===============================
@router.post("/aes-demo")
def aes_encrypt(data: str):
    result = encrypt_and_verify_aes(data)

    # ✅ SOC EVENT
    log_event(
        event_type="AES_ENCRYPT_SUCCESS",
        message="AES-256-GCM encryption completed",
        meta={
            "module": "aes",
            "level": "success"
        }
    )

    return result

# ===============================
# DECRYPT
# ===============================
@router.post("/aes-decrypt")
def aes_decrypt(ciphertext: str, nonce: str):
    try:
        result = decrypt_and_verify_aes(ciphertext, nonce)

        # ✅ SOC EVENT (success)
        log_event(
            event_type="AES_DECRYPT_SUCCESS",
            message="AES-256-GCM decryption verified",
            meta={
                "module": "aes",
                "level": "success"
            }
        )

        return result

    except ValueError:
        # ✅ SOC EVENT (attack detected)
        log_event(
            event_type="AES_TAMPER_DETECTED",
            message="AES integrity verification failed",
            meta={
                "module": "attack",
                "level": "danger"
            }
        )

        raise HTTPException(
            status_code=400,
            detail="Integrity verification failed"
        )
