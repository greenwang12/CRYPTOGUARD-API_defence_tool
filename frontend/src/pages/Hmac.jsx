import { useState } from "react";
import { hmacAuth } from "../api/SecurityApi";
import { useThreat } from "../context/useThreat";
import { useHmac } from "../context/useHmac";

export default function Hmac() {
  const { setThreat } = useThreat();
  const { setLastAuth } = useHmac();

  /* ================= PAYLOAD ================= */
  const [action, setAction] = useState("AdminAction");
  const [userId, setUserId] = useState("103");
  const [resource, setResource] = useState("user_204");

  /* ================= STATE ================= */
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socLogs, setSocLogs] = useState([]);

  const addLogs = (logs) => {
    setSocLogs(
      logs.map(l => ({
        ...l,
        time: new Date().toLocaleTimeString()
      }))
    );
  };

  /* ================= RUN ================= */
  const run = async () => {
    setLoading(true);
    setTimeline(null);
    setSocLogs([]);

    try {
      const res = await hmacAuth({
        action,
        user_id: userId,
        resource
      });

      // 🔐 BUILD VERIFICATION TIMELINE (FRONTEND)
      const steps = [
        {
          step: 1,
          title: "Nonce",
          value: res.nonce
        },
        {
          step: 2,
          title: "Timestamp",
          value: res.timestamp
        },
        {
          step: 3,
          title: "Message",
          value: `${action}|${userId}|${resource}|${res.nonce}|${res.timestamp}`
        },
        {
          step: 4,
          title: "Secret Key",
          value: "demo-secret (hidden)"
        },
        {
          step: 5,
          title: "Signature",
          value: res.signature
        }
      ];

      setTimeline(steps);

      // 🌍 SAVE FOR ATTACK PAGE
      setLastAuth({
        payload: res,
        steps
      });

      setThreat("normal");

     addLogs([
  {
    type: "ok",
    title: "HMAC Verified",
    msg: "Request authenticated"
  },
  {
    type: "info",
    title: "Replay Protection",
    msg: "Nonce validated"
  },
  {
    type: "secure",
    title: "Integrity Check",
    msg: "Payload not tampered"
  }
]);

    } catch {
      setThreat("attack");
      addLogs([
        {
          type: "attack",
          title: "Integrity Violation",
          msg: "HMAC verification failed"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="soc-root">
      {/* ================= HEADER ================= */}
      <div className="soc-header">
        <h2>🔐 Secure API Operation · HMAC</h2>
      </div>

      <div className="soc-grid">
        {/* ================= LEFT PANEL ================= */}
        <div className="soc-panel">
          <h3>API Request Payload</h3>

          <label>Action</label>
          <input value={action} onChange={e => setAction(e.target.value)} />

          <label>User ID</label>
          <input value={userId} onChange={e => setUserId(e.target.value)} />

          <label>Target Resource</label>
          <input
            value={resource}
            onChange={e => setResource(e.target.value)}
          />

          <button onClick={run} disabled={loading}>
            {loading ? "Verifying…" : "Authenticate Request"}
          </button>
        </div>

        {/* ================= VERIFICATION TIMELINE ================= */}
        {timeline && (
          <div className="soc-panel timeline">
            <h3>Verification Timeline</h3>

            {timeline.map(s => (
              <div key={s.step} className="step">
                <div className="step-index">✔ {s.step}</div>
                <div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-value">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= SOC LOG ================= */}
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

      {/* ================= CSS (UNCHANGED) ================= */}
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
  .log.ok {
  border-left: 3px solid #22c55e;
  color: #86efac;
}

.log.info {
  border-left: 3px solid #38bdf8;
  color: #7dd3fc;
}

.log.secure {
  border-left: 3px solid #22d3ee;
  color: #67e8f9;
}


input {
  width: 94%;
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
  box-shadow: 0 10px 30px rgba(56,189,248,0.35);
}

.timeline .step {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
  padding: 12px;
  border-left: 3px solid #22c55e;
  background: rgba(2, 6, 23, 0.7);
  border-radius: 10px;
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
}

.log.attack {
  border-left: 3px solid #ef4444;
  background: rgba(127, 29, 29, 0.35);
  color: #fecaca;
}

time {
  font-size: 11px;
  opacity: 0.6;
}
      `}</style>
    </div>
  );
}
