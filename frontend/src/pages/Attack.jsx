import { useState } from "react";
import { simulateAttack } from "../api/SecurityApi";
import { useThreat } from "../context/useThreat";

export default function Attack() {
  const { setThreat } = useThreat();
  const [socLogs, setSocLogs] = useState([]);

  const pushLog = (type, title, msg) => {
    setSocLogs(prev => [
      {
        type,
        title,
        msg,
        time: new Date().toLocaleTimeString()
      },
      ...prev
    ]);
  };

  const runAttack = async (type) => {
    try {
      const res = await simulateAttack(type);

      if (res.detected) {
        // 🔥 SOC threat state
        setThreat("attack");

        pushLog(
          "attack",
          res.attack || "Attack Detected",
          res.reason || "Security violation detected"
        );
      } else {
        setThreat("normal");

        pushLog(
          "ok",
          "Request Allowed",
          "No malicious activity detected"
        );
      }
    } catch {
      setThreat("attack");

      pushLog(
        "attack",
        "Attack Simulation Failed",
        "Backend unreachable or error occurred"
      );
    }
  };

  const reset = () => {
    setThreat("normal");
    setSocLogs([]);
  };

  return (
    <div className="module-frame">
      <h2>🚨 API Attack Simulation</h2>

      <div className="attack-actions">
        <button
          onClick={() => runAttack("replay")}
          className="danger"
        >
          Replay Attack
        </button>

        <button
          onClick={() => runAttack("tamper")}
          className="danger"
        >
          Payload Tampering
        </button>

        <button onClick={reset}>
          Reset System
        </button>
      </div>

      {/* ===== SOC EVENT LOG ===== */}
      <div className="soc-panel soc-log">
        <h3>🛰 SOC Event Log</h3>

        {socLogs.length === 0 && (
          <p className="muted">No events yet</p>
        )}

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

      {/* ===== INLINE CSS ===== */}
      <style>{`
        .attack-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .danger {
          background: #7f1d1d;
          color: #fecaca;
          border: none;
          padding: 10px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }

        .soc-log {
          margin-top: 20px;
        }

        .log {
          display: grid;
          grid-template-columns: 28px 1fr auto;
          gap: 12px;
          padding: 12px;
          margin-bottom: 10px;
          border-radius: 10px;
          background: rgba(2, 6, 23, 0.7);
          font-size: 13px;
        }

        .log.ok {
          border-left: 3px solid #22c55e;
        }

        .log.attack {
          border-left: 3px solid #ef4444;
          background: rgba(127, 29, 29, 0.35);
          color: #fecaca;
        }

        .muted {
          opacity: 0.6;
          font-size: 13px;
        }

        time {
          font-size: 11px;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
