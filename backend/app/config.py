import os

# 32-byte key (AES-256)
AES_KEY = os.getenv(
    "AES_KEY",
    "0123456789abcdef0123456789abcdef"
)

HMAC_SECRET = os.getenv(
    "HMAC_SECRET",
    "supersecretkey"
)
