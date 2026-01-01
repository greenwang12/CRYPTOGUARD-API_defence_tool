from fastapi import APIRouter, HTTPException
from app.security import verify_hmac_request
from app.soc_store import log_event

router = APIRouter()

@router.post("/hmac-demo")
def hmac_demo(
    action: str,
    user_id: str,
    resource: str,
    nonce: str,
    timestamp: str,
    signature: str
):
    try:
        verify_hmac_request(
            action,
            user_id,
            resource,
            nonce,
            timestamp,
            signature
        )
    except ValueError as e:
        log_event(
            event_type="HMAC_ATTACK_BLOCKED",
            message=str(e),
            meta={"module": "hmac", "level": "danger"}
        )
        raise HTTPException(status_code=401, detail=str(e))

    log_event(
        event_type="HMAC_AUTH_SUCCESS",
        message="Critical API operation authenticated",
        meta={"module": "hmac", "level": "success"}
    )

    # 🔹 BUILD VERIFICATION STEPS (FOR UI)
    message = f"{action}|{user_id}|{resource}|{nonce}|{timestamp}"

    return {
        "status": "Authenticated",
        "steps": [
            {
                "step": 1,
                "title": "Nonce",
                "value": nonce
            },
            {
                "step": 2,
                "title": "Timestamp",
                "value": timestamp
            },
            {
                "step": 3,
                "title": "Message",
                "value": message
            },
            {
                "step": 4,
                "title": "Secret Key",
                "value": "super••••"
            },
            {
                "step": 5,
                "title": "Signature",
                "value": signature
            }
        ]
    }
