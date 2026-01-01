from datetime import datetime
from typing import Dict, List, Optional

SOC_EVENTS: List[Dict] = []
MAX_EVENTS = 1000

def log_event(event_type: str, message: str, meta: Optional[Dict] = None) -> Dict:
    event = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "event_type": event_type,
        "message": message,
        "meta": meta or {}
    }

    SOC_EVENTS.append(event)
    if len(SOC_EVENTS) > MAX_EVENTS:
        SOC_EVENTS.pop(0)

    return event

def get_events(limit: int = 100) -> List[Dict]:
    return SOC_EVENTS[-limit:][::-1]

def clear_events() -> None:
    SOC_EVENTS.clear()
