from fastapi import APIRouter
from app.security import hmac_auth_with_steps
from app.config import HMAC_SECRET
from app.soc_store import log_event

router = APIRouter()

@router.post("/hmac-demo")
def hmac_demo(
    action: str,
    user_id: str,
    resource: str,
    nonce: str = None,
    timestamp: str = None
):
    result = hmac_auth_with_steps(
        action=action,
        user_id=user_id,
        resource=resource,
        secret=HMAC_SECRET,
        nonce=nonce,
        timestamp=timestamp
    )

    log_event(
        event_type="HMAC_AUTH_SUCCESS",
        message="Critical API operation authenticated",
        meta={
            "module": "hmac",
            "action": action,
            "user_id": user_id,
            "resource": resource,
            "level": "success"
        }
    )

    return result
