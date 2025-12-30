import { useState } from "react";
import { hmacAuth } from "../api/SecurityApi";
import { useThreat } from "../context/useThreat";

export default function Hmac() {
  const { setThreat } = useThreat();

  // 🔐 Generic, non-payment payload
  const [action, setAction] = useState("AdminAction");
  const [userId, setUserId] = useState("103");
  const [resource, setResource] = useState("user_204");

  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 SOC LOG STATE
  const [socLogs, setSocLogs] = useState([]);

  const addLogs = (logs) => {
    setSocLogs(
      logs.map((l) => ({
        ...l,
        time: new Date().toLocaleTimeString()
      }))
    );
  };

  const run = async () => {
    setLoading(true);
    setRes(null);
    setSocLogs([]);

    try {
      const r = await hmacAuth({
        action,
        user_id: userId,
        resource
      });

      setThreat("normal");
      setRes(r);

      // ✅ SUCCESS LOGS
      addLogs([
        {
          type: "ok",
          title: "HMAC Verified",
          msg: "Critical API request authenticated"
        },
        {
          type: "info",
          title: "Replay Protection",
          msg: "Nonce and timestamp validated"
        },
        {
          type: "secure",
          title: "Integrity Confirmed",
          msg: "Request payload not modified"
        }
      ]);
    } catch {
      setThreat("tamper");

      // ❌ ATTACK LOG
      addLogs([
        {
          type: "attack",
          title: "Integrity Violation",
          msg: "HMAC signature mismatch detected"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="soc-root">
      {/* HEADER */}
      <div className="soc-header">
        <h2>🔐 Secure API Operation · HMAC</h2>
        {res?.status && <span className="ok">{res.status}</span>}
      </div>

      <div className="soc-grid">
        {/* LEFT PANEL */}
        <div className="soc-panel">
          <h3>API Request Payload</h3>

          <label>Action</label>
          <input value={action} onChange={(e) => setAction(e.target.value)} />

          <label>User ID</label>
          <input value={userId} onChange={(e) => setUserId(e.target.value)} />

          <label>Target Resource</label>
          <input
            value={resource}
            onChange={(e) => setResource(e.target.value)}
          />

          <button onClick={run} disabled={loading}>
            {loading ? "Verifying…" : "Authenticate Request"}
          </button>
        </div>

        {/* TIMELINE */}
        <div className="soc-panel timeline">
          <h3>Verification Timeline</h3>

          {res?.steps?.map((s) => (
            <div key={s.step} className="step">
              <div className="step-index">✔ {s.step}</div>
              <div>
                <div className="step-title">{s.title}</div>
                <div className="step-value">
                  {s.title === "Secret Key"
                    ? s.value.slice(0, 5) + "••••"
                    : s.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SOC EVENT LOG */}
        {socLogs.length > 0 && (
          <div className="soc-panel soc-log">
            <h3>🛰 SOC Event Log</h3>

            {socLogs.map((l, i) => (
              <div key={i} className={`log ${l.type}`}>
                <span>{l.type === "attack" ? "❌" : "✔"}</span>
                <div>
                  <b>{l.title}</b>
                  <p>{l.msg}</p>
                </div>
                <time>{l.time}</time>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INLINE CSS */}
      <style>{`
        .soc-root {
          padding: 28px;
          background: radial-gradient(circle at top, #0f172a, #020617);
          color: #e5e7eb;
          min-height: 100vh;
          font-family: system-ui;
        }

        .soc-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .ok {
          color: #22c55e;
          font-weight: 700;
        }

        .soc-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 22px;
        }

        .soc-panel {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 0 40px rgba(56, 189, 248, 0.12);
        }

        h3 {
          margin-bottom: 14px;
          color: #38bdf8;
        }

        label {
          font-size: 12px;
          opacity: 0.8;
        }

        input {
          width: 100%;
          margin-bottom: 12px;
          padding: 10px;
          border-radius: 8px;
          background: #020617;
          border: 1px solid #1e293b;
          color: #e5e7eb;
        }

        button {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          background: linear-gradient(135deg, #38bdf8, #22d3ee);
          border: none;
          font-weight: 700;
          cursor: pointer;
          color: #020617;
        }

        .timeline .step {
          display: flex;
          gap: 12px;
          margin-bottom: 14px;
          padding: 12px;
          border-left: 3px solid #22c55e;
          background: rgba(2, 6, 23, 0.7);
          border-radius: 10px;
          animation: glow 0.4s ease;
        }

        .step-index {
          font-weight: 800;
          color: #22c55e;
        }

        .step-title {
          font-size: 13px;
          opacity: 0.7;
        }

        .step-value {
          font-family: monospace;
          word-break: break-all;
        }

        .soc-log .log {
          display: grid;
          grid-template-columns: 28px 1fr auto;
          gap: 12px;
          padding: 12px;
          margin-bottom: 10px;
          border-radius: 10px;
          background: rgba(2, 6, 23, 0.7);
          font-size: 13px;
          animation: slide 0.3s ease;
        }

        .log.ok { border-left: 3px solid #22c55e; }
        .log.info { border-left: 3px solid #38bdf8; }
        .log.secure { border-left: 3px solid #a78bfa; }

        .log.attack {
          border-left: 3px solid #ef4444;
          background: rgba(127, 29, 29, 0.35);
          color: #fecaca;
        }

        time {
          font-size: 11px;
          opacity: 0.6;
        }

        @keyframes glow {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
