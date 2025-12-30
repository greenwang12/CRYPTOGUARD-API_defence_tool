from datetime import datetime
from typing import Dict, List, Optional

# ===============================
# In-Memory SOC Event Store
# ===============================

SOC_EVENTS: List[Dict] = []


def log_event(
    event_type: str,
    message: str,
    meta: Optional[Dict] = None
) -> Dict:
    """
    Store a SOC (Security Operations Center) event.

    Parameters:
    - event_type: short event code (e.g., HMAC_AUTH_SUCCESS)
    - message: human-readable description
    - meta: additional structured metadata

    Returns:
    - stored event object
    """

    event = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "event_type": event_type,
        "message": message,
        "meta": meta or {}
    }

    SOC_EVENTS.append(event)
    return event


def get_events(limit: int = 100) -> List[Dict]:
    """
    Fetch latest SOC events (newest first).
    """
    return SOC_EVENTS[-limit:][::-1]


def clear_events() -> None:
    """
    Clear SOC logs (useful for demo reset).
    """
    SOC_EVENTS.clear()
