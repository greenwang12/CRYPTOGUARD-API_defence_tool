import axios from "axios";
import CryptoJS from "crypto-js";

const API = import.meta.env.VITE_API_BASE;
const SECRET = "demo-secret"; // DEMO ONLY

/* ===============================
   ARGON2 PASSWORD HASHING
================================ */
export async function hashPassword(password) {
  const res = await axios.post(`${API}/argon2-demo`, null, {
    params: { password }
  });
  return res.data;
}

/* ===============================
   AES ENCRYPTION
================================ */
export async function encryptAES(data) {
  const res = await axios.post(`${API}/aes-demo`, null, {
    params: { data }
  });
  return res.data;
}

export async function decryptAES({ ciphertext, nonce }) {
  const res = await axios.post(`${API}/aes-decrypt`, null, {
    params: { ciphertext, nonce }
  });
  return res.data;
}

/* ======================================================
   HMAC SIGNING
====================================================== */
function sign({ action, user_id, resource, nonce, timestamp }) {
  const msg = `${action}|${user_id}|${resource}|${nonce}|${timestamp}`;
  return CryptoJS.HmacSHA256(msg, SECRET).toString();
}

/* ======================================================
   BASE PAYLOAD (SHARED BY HMAC + ATTACK)
====================================================== */
export function basePayload(overrides = {}) {
  return {
    action: "AdminAction",
    user_id: "103",
    resource: "user_204",
    nonce: crypto.randomUUID().replace(/-/g, "").slice(0, 12),
    timestamp: Math.floor(Date.now() / 1000).toString(),
    ...overrides
  };
}

/* ======================================================
   NORMAL / VALID HMAC REQUEST
   (Used by Hmac.jsx)
====================================================== */
export async function sendValidHmac(payload = {}) {
  const fullPayload = basePayload(payload);

  const signed = {
    ...fullPayload,
    signature: sign(fullPayload)
  };

  const res = await axios.post(`${API}/hmac-demo`, null, {
    params: signed
  });

  // ✅ IMPORTANT: return backend verification steps
  return res.data;
}

/* ======================================================
   MAIN EXPORT USED BY UI
====================================================== */
export async function hmacAuth(payload = {}) {
  return sendValidHmac(payload);
}

/* ======================================================
   PAYLOAD TAMPERING ATTACK
====================================================== */
export async function tamperAttack(field) {
  const original = basePayload();
  original.signature = sign(original);

  const modified = { ...original };

  switch (field) {
    case "action":
      modified.action = "DeleteAllUsers";
      break;
    case "user_id":
      modified.user_id = "999";
      break;
    case "resource":
      modified.resource = "all_users";
      break;
    case "nonce":
      modified.nonce = "tamperednonce";
      break;
    default:
      break;
  }

  try {
    await axios.post(`${API}/hmac-demo`, null, {
      params: modified
    });
  } catch {
    throw {
      type: "tamper",
      original,
      modified,
      reason: "HMAC signature mismatch (payload tampered)"
    };
  }
}

/* ======================================================
   REPLAY ATTACK
====================================================== */
export async function replayAttack({ changeNonce = false } = {}) {
  const original = basePayload();
  original.signature = sign(original);

  // First request (valid)
  await axios.post(`${API}/hmac-demo`, null, {
    params: original
  });

  const replay = { ...original };

  if (changeNonce) {
    replay.nonce = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    replay.signature = sign(replay);
  }

  try {
    await axios.post(`${API}/hmac-demo`, null, {
      params: replay
    });

    return {
      type: "replay",
      mode: "nonce_changed",
      original,
      replay,
      result: "Accepted (new nonce + recomputed signature)"
    };
  } catch {
    throw {
      type: "replay",
      mode: "nonce_reused",
      original,
      replay,
      reason: "Nonce reused (replay attack detected)"
    };
  }
}
