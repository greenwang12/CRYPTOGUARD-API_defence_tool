from fastapi import APIRouter
from app.soc_store import get_events

router = APIRouter(prefix="/soc", tags=["SOC"])


@router.get("/soc-status")
def soc_status():
    events = get_events(200)

    # Detect activity by scanning recent events
    def active(module: str) -> bool:
        return any(e["meta"].get("module") == module for e in events)

    return {
        "system": "online",
        "modules": {
            "argon2": "ACTIVE" if active("argon2") else "IDLE",
            "aes": "ACTIVE" if active("aes") else "IDLE",
            "hmac": "ACTIVE" if active("hmac") else "IDLE",
            "attack": "MONITORING" if active("attack") else "CLEAR"
        },
        "event_count": len(events),
        "events": events
    }
