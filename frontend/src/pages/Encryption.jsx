import { useState } from "react";
import { encryptAES, decryptAES } from "../api/SecurityApi";
import { useThreat } from "../context/useThreat";

export default function Encryption() {
  const { setThreat } = useThreat();

  const [data, setData] = useState("");
  const [showData, setShowData] = useState(false);

  const [result, setResult] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [timeline, setTimeline] = useState([]);

  /* ================= SOC LOG ================= */
  const logEvent = (type, message) => {
    setTimeline(t => [
      {
        id: crypto.randomUUID(),
        time: new Date().toLocaleTimeString(),
        type,
        message
      },
      ...t
    ]);
  };

  /* ================= ENCRYPT ================= */
  const runEncrypt = async () => {
  if (!data || loading) return;

  setLoading(true);
  setResult(null);
  setVerifyResult(null);

  logEvent("info", "AES encryption initialized");

  try {
    const res = await encryptAES(data);

    // ✅ FIX HERE
    setResult({
      key: res.key,
      nonce: res.nonce,
      ciphertext: res.ciphertext
    });

    logEvent("success", "AES key generated");
    logEvent("success", "Nonce generated");
    logEvent("success", "Ciphertext created");
  } catch (e) {
    console.error(e);
    logEvent("danger", "Encryption failed");
  }

  setLoading(false);
};

  /* ================= VERIFY ================= */
  const runVerify = async () => {
    if (!result || verifying) return;

    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await decryptAES({
        ciphertext: result.ciphertext,
        nonce: result.nonce
      });

      setThreat("normal");
      setVerifyResult(res);

      logEvent("success", "AES-GCM integrity verified");
      logEvent("success", "Plaintext recovered");
    } catch {
      setThreat("tamper");
      setVerifyResult({ error: true });

      logEvent("danger", "Integrity verification failed");
      logEvent("danger", "Possible data tampering detected");
    }

    setVerifying(false);
  };

  return (
    <>
      <div className="soc-shell">
        {/* HEADER */}
        <div className="soc-header">
          <h2>🔒 Data Encryption — AES-256-GCM</h2>
          <div className="soc-header-right">
            <span>ATTACK SIMULATION MODE</span>
            <div className="toggle on" />
          </div>
        </div>

        <div className="soc-body">
          {/* LEFT */}
          <div className="soc-left">
            <label>Card Number</label>

            <div className="input-wrap">
              <input
                type={showData ? "text" : "password"}
                placeholder="4111 1111 1111 1111"
                value={data}
                onChange={e => setData(e.target.value)}
              />
              <span onClick={() => setShowData(!showData)}>
               {showData ? (
  /* Eye OPEN (showing data) */
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-label="Hide value"
  >
    <path
      d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
) : (
  /* Eye CLOSED (hidden) */
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-label="Show value"
  >
    <path
      d="M3 3l18 18"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M2 12s4-6 10-6 10 6 10 6"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
)}

              </span>
            </div>

            <button className="primary" onClick={runEncrypt} disabled={loading}>
              {loading ? "Encrypting…" : "Encrypt Data"}
            </button>
          </div>

          {/* RIGHT */}
          <div className="soc-right">
            <Step title="Step 1: Generate AES Key" value={result?.key} />
            <Step title="Step 2: Generate Nonce (IV)" value={result?.nonce} />
            <Step title="Step 3: Encrypt Data" value={result?.ciphertext} />

            {result && (
              <button
                className="secondary"
                onClick={runVerify}
                disabled={verifying}
              >
                {verifying ? "Verifying…" : "Decrypt & Verify"}
              </button>
            )}

            {verifyResult && !verifyResult.error && (
              <>
                <Step title="✔ Integrity Verified" value="AES-GCM authentication passed" />
                <Step
                  title="Plaintext Recovered"
                  value={mask(verifyResult.plaintext)}
                />
              </>
            )}

            {verifyResult?.error && (
              <Step
                title="❌ Verification Failed"
                value="Integrity check failed — tampering detected"
                danger
              />
            )}

            {/* SOC TIMELINE */}
            <div className="timeline">
              <div className="timeline-title">SOC Timeline Log</div>

              {timeline.length === 0 && (
                <div className="timeline-empty">
                  No security events recorded yet
                </div>
              )}

              {timeline.map(e => (
                <div key={e.id} className={`timeline-item ${e.type}`}>
                  <div className="timeline-time">{e.time}</div>
                  <div className="timeline-msg">{e.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= INLINE CSS ================= */}
      <style>{`
        .soc-shell {
          background: radial-gradient(circle at top, #0f172a, #020617);
          border-radius: 22px;
          padding: 24px;
          color: #e5e7eb;
          box-shadow: 0 0 80px rgba(0,255,180,0.15);
        }

        .soc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 14px;
        }

        .soc-header-right {
          display: flex;
          gap: 12px;
          font-size: 12px;
          opacity: 0.8;
          align-items: center;
        }

        .toggle {
          width: 44px;
          height: 22px;
          border-radius: 999px;
          background: #16a34a;
        }

        .soc-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          margin-top: 22px;
        }

        .soc-left, .soc-right {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        label {
          font-size: 13px;
          opacity: 0.8;
        }

        .input-wrap {
          position: relative;
        }

        .input-wrap input {
          width: 95%;
          padding: 14px;
          border-radius: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
        }

        .input-wrap span {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
        }

        button {
          border-radius: 12px;
          padding: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }

        .primary {
          background: linear-gradient(180deg, #2f855a, #166534);
          color: #ecfdf5;
        }

        .secondary {
          background: linear-gradient(180deg, #1f2937, #111827);
          border: 1px solid rgba(255,255,255,0.15);
          color: #e5e7eb;
        }

        .step {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .step-title {
          font-size: 14px;
          color: #86efac;
        }

        .step-body {
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.12);
          padding: 12px;
          border-radius: 10px;
          font-family: monospace;
          font-size: 13px;
        }

        .danger .step-title {
          color: #f87171;
        }

        .timeline {
          margin-top: 18px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 14px;
          max-height: 240px;
          overflow-y: auto;
        }

        .timeline-title {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #93c5fd;
        }

        .timeline-empty {
          font-size: 12px;
          opacity: 0.5;
        }

        .timeline-item {
          display: flex;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          margin-bottom: 6px;
          font-size: 12px;
        }

        .timeline-time {
          min-width: 64px;
          opacity: 0.6;
        }

        .timeline-item.info {
          background: rgba(59,130,246,0.12);
          color: #bfdbfe;
        }

        .timeline-item.success {
          background: rgba(34,197,94,0.12);
          color: #86efac;
        }

        .timeline-item.danger {
          background: rgba(239,68,68,0.12);
          color: #fca5a5;
        }
      `}</style>
    </>
  );
}

function Step({ title, value, danger }) {
  return (
    <div className={`step ${danger ? "danger" : ""}`}>
      <div className="step-title">✔ {title}</div>
      <div className="step-body">{value || "Waiting…"}</div>
    </div>
  );
}

function mask(text) {
  if (!text) return "";
  if (text.length <= 4) return "****";
  return "**** **** **** " + text.slice(-4);
}
