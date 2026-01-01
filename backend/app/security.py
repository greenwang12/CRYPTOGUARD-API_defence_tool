import os
import hmac
import hashlib
import time
import uuid

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from argon2 import PasswordHasher
from argon2.low_level import Type

# ===============================
# GLOBALS
# ===============================

USED_NONCES = set()

AES_KEY = os.getenv("AES_KEY")
AES_KEY = AES_KEY.encode() if AES_KEY else os.urandom(32)

HMAC_SECRET = os.getenv("HMAC_SECRET", "demo-secret")

ph = PasswordHasher(
    memory_cost=65536,
    time_cost=3,
    parallelism=4,
    hash_len=32,
    salt_len=16,
    type=Type.ID
)

# ===============================
# ARGON2 (DEMO)
# ===============================

def hash_password_with_steps(password: str):
    hashed = ph.hash(password)
    salt = hashed.split("$")[4]

    return {
        "algorithm": "Argon2id",
        "status": "Password secured",
        "steps": {
            "salt": salt,
            "params": {
                "memory": ph.memory_cost,
                "iterations": ph.time_cost,
                "parallelism": ph.parallelism
            },
            "hash": hashed
        }
    }

# ===============================
# AES (DEMO)
# ===============================

def encrypt_and_verify_aes(data: str):
    aes = AESGCM(AES_KEY)
    nonce = os.urandom(12)
    ciphertext = aes.encrypt(nonce, data.encode(), None)

    return {
        "algorithm": "AES-256-GCM",
        "status": "Encrypted",
        "key": AES_KEY.hex(),          # ✅ ADDED (demo only)
        "nonce": nonce.hex(),
        "ciphertext": ciphertext.hex()
    }


def decrypt_and_verify_aes(ciphertext: str, nonce: str):
    aes = AESGCM(AES_KEY)
    try:
        plaintext = aes.decrypt(
            bytes.fromhex(nonce),
            bytes.fromhex(ciphertext),
            None
        ).decode()

        return {
            "algorithm": "AES-256-GCM",
            "status": "Verified",
            "plaintext": plaintext
        }
    except Exception:
        raise ValueError("Integrity verification failed")

# ===============================
# HMAC GENERATION (FRONTEND DEMO SUPPORT)
# ===============================

def hmac_auth_with_steps(action, user_id, resource, secret):
    nonce = uuid.uuid4().hex[:12]
    timestamp = str(int(time.time()))

    message = f"{action}|{user_id}|{resource}|{nonce}|{timestamp}"
    signature = hmac.new(
        secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

    return {
        "algorithm": "HMAC-SHA256",
        "status": "Generated",
        "nonce": nonce,
        "timestamp": timestamp,
        "signature": signature
    }

# ===============================
# HMAC VERIFICATION (REAL SECURITY)
# ===============================

def verify_hmac_request(
    action: str,
    user_id: str,
    resource: str,
    nonce: str,
    timestamp: str,
    signature: str
):
    # 1️⃣ Replay protection (nonce reuse)
    if nonce in USED_NONCES:
        raise ValueError("Replay attack detected (nonce reused)")

    # 2️⃣ Timestamp freshness (30 seconds window)
    if abs(int(time.time()) - int(timestamp)) > 30:
        raise ValueError("Stale request detected")

    # 3️⃣ Recompute HMAC on backend
    message = f"{action}|{user_id}|{resource}|{nonce}|{timestamp}"
    expected_signature = hmac.new(
        HMAC_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

    # 4️⃣ Payload integrity check
    if not hmac.compare_digest(expected_signature, signature):
        raise ValueError("HMAC signature mismatch (payload tampered)")

    # 5️⃣ Mark nonce as used ONLY after full verification
    USED_NONCES.add(nonce)
