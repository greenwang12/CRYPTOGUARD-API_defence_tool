import { useState } from "react";
import { tamperAttack, replayAttack } from "../api/SecurityApi";
import { useThreat } from "../context/useThreat";
import { useHmac } from "../context/useHmac";

export default function Attack() {
  const { setThreat } = useThreat();
  const { lastAuth } = useHmac();

  const [proof, setProof] = useState(null);
  const [logs, setLogs] = useState([]);

  const [tamperField, setTamperField] = useState("action");
  const [replayMode, setReplayMode] = useState("same");

  const [attackAnim, setAttackAnim] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);

  const log = (type, title, msg) => {
    setLogs(prev => [
      { type, title, msg, time: new Date().toLocaleTimeString() },
      ...prev
    ]);
  };

  /* ================= NORMAL ================= */
  const runNormal = () => {
    if (!lastAuth) {
      setThreat("attack");
      log("attack", "No Authenticated Request", "Authenticate via HMAC first");
      return;
    }

    setThreat("normal");
    setSuccessAnim(true);
    setAttackAnim(false);

    setProof({
      type: "normal",
      original: lastAuth.payload,
      steps: lastAuth.steps
    });

    log("ok", "HMAC Verified", "Authenticated payload reused");

    setTimeout(() => setSuccessAnim(false), 1200);
  };

  /* ================= TAMPER ================= */
  const runTamper = async () => {
    try {
      await tamperAttack(tamperField);
    } catch (e) {
      setThreat("attack");
      setProof(e);

      log("attack", "Payload Tampering Blocked", e.reason);

      setAttackAnim(true);
      setTimeout(() => setAttackAnim(false), 1200);
    }
  };

  /* ================= REPLAY ================= */
  const runReplay = async () => {
    try {
      const res = await replayAttack({
        changeNonce: replayMode === "new"
      });

      setThreat("normal");
      setProof(res);

      log("ok", "Replay Accepted", res.result);

      setSuccessAnim(true);
      setTimeout(() => setSuccessAnim(false), 1200);
    } catch (e) {
      setThreat("attack");
      setProof(e);

      log("attack", "Replay Blocked", e.reason);

      setAttackAnim(true);
      setTimeout(() => setAttackAnim(false), 1200);
    }
  };

  /* ================= RESET ================= */
  const reset = () => {
    setThreat("normal");
    setLogs([]);
    setProof(null);
  };

  return (
    <div
      className={`module-frame ${
        attackAnim ? "attack-pulse" : successAnim ? "success-pulse" : ""
      }`}
    >
      <h2>🚨 Real API Attack Simulation</h2>

      {/* ================= CONTROLS ================= */}
      <div className="attack-actions">
        <button onClick={runNormal}>Normal Request</button>

        <div className="control">
          <select value={tamperField} onChange={e => setTamperField(e.target.value)}>
            <option value="action">Tamper Action</option>
            <option value="user_id">Tamper User ID</option>
            <option value="resource">Tamper Resource</option>
            <option value="nonce">Tamper Nonce</option>
          </select>
          <button className="danger" onClick={runTamper}>
            Payload Tampering
          </button>
        </div>

        <div className="control">
          <select value={replayMode} onChange={e => setReplayMode(e.target.value)}>
            <option value="same">Replay Same Nonce</option>
            <option value="new">Replay New Nonce</option>
          </select>
          <button className="danger" onClick={runReplay}>
            Replay Attack
          </button>
        </div>

        <button onClick={reset}>Reset</button>
      </div>

      {/* ================= PROOF ================= */}
      {proof && (
        <div className={`proof-panel ${attackAnim ? "shake" : ""}`}>
          <h3>🔎 Request Proof</h3>

          {/* NORMAL */}
          {proof.type === "normal" && (
            <>
              <h4>Original Payload</h4>
              <pre className="original">
{JSON.stringify(proof.original, null, 2)}
              </pre>
            </>
          )}

          {/* TAMPER */}
          {proof.original && proof.modified && (
            <div className="diff-grid">
              <div>
                <h4>Original Payload</h4>
                <pre className="original">
{JSON.stringify(proof.original, null, 2)}
                </pre>
              </div>

              <div>
                <h4>Modified Payload</h4>
                <pre className="modified">
{JSON.stringify(proof.modified, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* REPLAY */}
          {proof.original && proof.replay && (
            <div className="diff-grid">
              <div>
                <h4>Original Request</h4>
                <pre className="original">
{JSON.stringify(proof.original, null, 2)}
                </pre>
              </div>

              <div>
                <h4>Replayed Request</h4>
                <pre className="modified">
{JSON.stringify(proof.replay, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {(proof.reason || proof.result) && (
            <div className={`alert ${proof.reason ? "danger" : "success"}`}>
              {proof.reason || proof.result}
            </div>
          )}
        </div>
      )}

      {/* ================= SOC EVENT LOG ================= */}
      <div className="soc-panel soc-log">
        <h3>🛰 SOC Event Log</h3>

        {logs.length === 0 && (
          <div className="log muted">No security events yet</div>
        )}

        {logs.map((l, i) => (
          <div key={i} className={`log ${l.type}`}>
            <span className="icon">
              {l.type === "attack" ? "❌" : "✔"}
            </span>

            <div className="log-body">
              <b>{l.title}</b>
              <p>{l.msg}</p>
            </div>

            <time>{l.time}</time>
          </div>
        ))}
      </div>

      {/* ================= CSS ================= */}
      <style>{`
.attack-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.control {
  display: flex;
  gap: 8px;
}

button {
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  cursor: pointer;
}

.danger {
  background: #7f1d1d;
  color: #fecaca;
}

.proof-panel {
  background: rgba(2,6,23,0.9);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 24px;
  font-family: monospace;
}

.diff-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

pre {
  background: #020617;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  overflow-x: auto;
}

.original { border-left: 4px solid #22c55e; }
.modified { border-left: 4px solid #ef4444; }

.alert.success {
  background: rgba(34,197,94,0.15);
  color: #86efac;
}
.alert.danger {
  background: rgba(239,68,68,0.15);
  color: #fca5a5;
}

/* ================= SOC LOG ================= */
.soc-log .log {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 12px;
  padding: 14px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: rgba(2, 6, 23, 0.75);
  font-size: 13px;
  animation: slideIn 0.25s ease;
}

.log.ok { border-left: 4px solid #22c55e; color: #86efac; }
.log.info { border-left: 4px solid #38bdf8; color: #7dd3fc; }
.log.secure { border-left: 4px solid #22d3ee; color: #67e8f9; }
.log.attack {
  border-left: 4px solid #ef4444;
  background: rgba(127,29,29,0.35);
  color: #fecaca;
}

.log.muted { opacity: 0.6; font-style: italic; }

.icon { font-size: 16px; }

.log-body b { display: block; font-weight: 700; }
.log-body p { margin: 2px 0 0; opacity: 0.85; }

time { font-size: 11px; opacity: 0.6; align-self: center; }

.attack-pulse { animation: dangerPulse 0.8s ease; }
.success-pulse { animation: successPulse 0.8s ease; }
.shake { animation: shake 0.4s ease; }

@keyframes dangerPulse {
  50% { box-shadow: 0 0 80px rgba(239,68,68,0.6); }
}
@keyframes successPulse {
  50% { box-shadow: 0 0 80px rgba(34,197,94,0.6); }
}
@keyframes shake {
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
      `}</style>
    </div>
  );
}
