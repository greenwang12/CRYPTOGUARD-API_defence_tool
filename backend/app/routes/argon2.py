from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import json, time

from app.security import hash_password_with_steps
from app.soc_store import log_event

router = APIRouter()

# ===============================
# NORMAL (NON-STREAM)
# ===============================
@router.get("/argon2")
def argon2_hash(password: str):
    return hash_password_with_steps(password)

# ===============================
# STREAMING (SSE)
# ===============================
@router.get("/argon2-stream")
def argon2_stream(password: str):

    def stream():
        result = hash_password_with_steps(password)
        steps = result["steps"]

        yield f"data: {json.dumps({'step': 'salt', 'value': steps['salt']})}\n\n"
        time.sleep(1)

        yield f"data: {json.dumps({'step': 'params', 'value': steps['params']})}\n\n"
        time.sleep(1)

        yield f"data: {json.dumps({'step': 'hash', 'value': steps['hash']})}\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")

# ===============================
# DEMO API (USED BY UI)
# ===============================
@router.post("/argon2-demo")
def argon2_demo(password: str):
    result = hash_password_with_steps(password)

    # ✅ CORRECT SOC EVENT
    log_event(
        event_type="ARGON2_HASH_SUCCESS",
        message="Argon2 password hash generated",
        meta={
            "module": "argon2",
            "level": "success"
        }
    )

    return result
