from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import argon2, aes, hmac, attack
from app.routes import soc
from app.routes import ws


app = FastAPI(
    title="CryptoGuard",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(argon2.router)
app.include_router(aes.router)
app.include_router(hmac.router)
app.include_router(attack.router)
app.include_router(soc.router)
app.include_router(ws.router)


@app.get("/")
def root():
    return {"status": "CryptoGuard running"}
