from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.ws_manager import ws_manager

router = APIRouter()

@router.websocket("/ws/soc")
async def soc_ws(ws: WebSocket):
    await ws_manager.connect(ws)
    try:
        while True:
            await ws.receive_text()  # keep alive
    except WebSocketDisconnect:
        ws_manager.disconnect(ws)
