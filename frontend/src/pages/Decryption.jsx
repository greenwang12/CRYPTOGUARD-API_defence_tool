import { useState } from "react";
import { decryptAES } from "../api/SecurityApi";
import { useThreat } from "../context/useThreat";

export default function Decryption() {
  const { setThreat } = useThreat();

  const [ciphertext, setCiphertext] = useState("");
  const [nonce, setNonce] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [timeline, setTimeline] = useState([]);

  /* ============== SOC LOG ============== */
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

  /* ============== DECRYPT & VERIFY ============== */
  const runDecrypt = async () => {
    if (!ciphertext || !nonce || loading) return;

    setLoading(true);
    setResult(null);
    setError(null);

    logEvent("info", "Decryption request received");
    logEvent("info", "Nonce supplied for verification");

    try {
      const res = await decryptAES({ ciphertext, nonce });
      // res = { algorithm, status, plaintext }

      setThreat("normal");
      setResult(res);

      logEvent("success", "AES-GCM integrity verified");
      logEvent("success", "Plaintext successfully recovered");
    } catch {
      setThreat("tamper");
      setError("Integrity verification failed — data tampering detected");

      logEvent("danger", "Integrity verification failed");
      logEvent("danger", "Possible ciphertext or nonce tampering");
    }

    setLoading(false);
  };

  return (
    <>
      <div className="soc-shell">
        {/* HEADER */}
        <div className="soc-header">
          <h2>🔓 Data Decryption — AES-256-GCM</h2>
          <span className="badge secure">SECURE MODE</span>
        </div>

        <div className="soc-body">
          {/* LEFT PANEL */}
          <div className="soc-left">
            <label>Ciphertext</label>
            <textarea
              className="soc-input"
              rows={4}
              value={ciphertext}
              onChange={e => setCiphertext(e.target.value)}
              placeholder="Paste encrypted ciphertext"
            />

            <label>Nonce / IV</label>
            <input
              className="soc-input"
              value={nonce}
              onChange={e => setNonce(e.target.value)}
              placeholder="Paste nonce / IV"
            />

            <button className="primary" onClick={runDecrypt} disabled={loading}>
              {loading ? "Decrypting…" : "Decrypt & Verify"}
            </button>
          </div>

          {/* RIGHT PANEL */}
          <div className="soc-right">
            {!result && !error && (
              <Step
                title="Awaiting Verification"
                value="Provide ciphertext and nonce to perform authenticated decryption."
              />
            )}

            {result && (
              <>
                <Step title="Algorithm" value={result.algorithm} />
                <Step title="Integrity Status" value={`✔ ${result.status}`} />
                <Step
                  title="Plaintext Recovered"
                  value={mask(result.plaintext)}
                />
              </>
            )}

            {error && (
              <Step title="❌ Decryption Blocked" value={error} danger />
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

      {/* ============== INLINE CSS ============== */}
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

        .badge.secure {
          font-size: 12px;
          background: rgba(34,197,94,0.15);
          color: #86efac;
          padding: 6px 12px;
          border-radius: 999px;
        }

        .soc-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          margin-top: 22px;
        }

        .soc-left,
        .soc-right {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        label {
          font-size: 13px;
          opacity: 0.8;
        }

        .soc-input {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          font-family: monospace;
        }

        button.primary {
          border-radius: 12px;
          padding: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          background: linear-gradient(180deg, #2563eb, #1e3a8a);
          color: #ecfdf5;
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
          max-height: 220px;
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

/* ============== STEP ============== */
function Step({ title, value, danger }) {
  return (
    <div className={`step ${danger ? "danger" : ""}`}>
      <div className="step-title">✔ {title}</div>
      <div className="step-body">{value}</div>
    </div>
  );
}

function mask(text) {
  if (!text) return "";
  if (text.length <= 4) return "****";
  return "**** **** **** " + text.slice(-4);
}
