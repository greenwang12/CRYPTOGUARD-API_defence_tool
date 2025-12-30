import axios from "axios";

/**
 * Base API URL
 * MUST be defined in frontend/.env as:
 * VITE_API_BASE=http://127.0.0.1:8000
 */
const API = import.meta.env.VITE_API_BASE;

if (!API) {
  console.error("❌ VITE_API_BASE is not defined");
}

/* ===============================
   ARGON2 PASSWORD HASHING
================================ */
export async function hashPassword(password) {
  const res = await axios.post(
    `${API}/argon2-demo`,
    null,
    { params: { password } }
  );
  return res.data;
}

/* ===============================
   AES ENCRYPTION
================================ */
export async function encryptAES(data) {
  const res = await axios.post(
    `${API}/aes-demo`,
    null,
    { params: { data } }
  );
  return res.data;
}

/* ===============================
   AES DECRYPTION
================================ */
export async function decryptAES({ ciphertext, nonce }) {
  const res = await axios.post(
    `${API}/aes-decrypt`,
    null,
    { params: { ciphertext, nonce } }
  );
  return res.data;
}

/* ===============================
   HMAC AUTHENTICATION
================================ */
export async function hmacAuth(payload) {
  const res = await axios.post(
    `${API}/hmac-demo`,
    null,
    { params: payload }
  );
  return res.data;
}

/* ===============================
   ATTACK SIMULATION
================================ */
export async function simulateAttack(type) {
  const res = await axios.post(
    `${API}/attack-simulate`,
    null,
    { params: { attack_type: type } }
  );
  return res.data;
}
