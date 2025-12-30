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
if AES_KEY:
    AES_KEY = AES_KEY.encode()
else:
    AES_KEY = os.urandom(32)

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
# ARGON2 PASSWORD HASHING
# ===============================

def hash_password_with_steps(password: str):
    hashed = ph.hash(password)

    # $argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>
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
# AES ENCRYPTION
# ===============================

def encrypt_and_verify_aes(data: str):
    aes = AESGCM(AES_KEY)

    nonce = os.urandom(12)
    ciphertext = aes.encrypt(nonce, data.encode(), None)

    return {
        "algorithm": "AES-256-GCM",
        "status": "Encrypted",
        "steps": {
            "key": AES_KEY.hex(),        # demo only
            "nonce": nonce.hex(),
            "ciphertext": ciphertext.hex()
        }
    }

# ===============================
# AES DECRYPTION
# ===============================

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
# HMAC AUTHENTICATION
# ===============================

def hmac_auth_with_steps(
    action: str,
    user_id: str,
    resource: str,          # ✅ renamed
    secret: str,
    nonce: str = None,
    timestamp: str = None
):
    nonce = nonce or uuid.uuid4().hex[:12]
    timestamp = timestamp or str(int(time.time()))

    if nonce in USED_NONCES:
        return {
            "status": "Blocked",
            "reason": "Replay attack detected"
        }

    USED_NONCES.add(nonce)

    # 🔐 HMAC message (domain-neutral)
    message = f"{action}|{user_id}|{resource}|{nonce}|{timestamp}"

    signature = hmac.new(
        secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

    return {
        "algorithm": "HMAC-SHA256",
        "status": "Request authenticated",
        "steps": [
            {"step": 1, "title": "Nonce", "value": nonce},
            {"step": 2, "title": "Timestamp", "value": timestamp},
            {"step": 3, "title": "Message", "value": message},
            {"step": 4, "title": "Secret Key", "value": secret},
            {"step": 5, "title": "Signature", "value": signature}
        ]
    }
