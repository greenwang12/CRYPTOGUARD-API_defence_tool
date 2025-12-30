import { useEffect, useState, useRef } from "react";

export default function Dashboard() {
  const [soc, setSoc] = useState({
    system: "online",
    modules: {
      argon2: "IDLE",
      aes: "IDLE",
      hmac: "IDLE",
      attack: "CLEAR"
    },
    events: []
  });

  const wsRef = useRef(null);
  const retryRef = useRef(null);

  /* ===============================
     INITIAL LOAD (BACKEND STATE)
  ================================ */
  useEffect(() => {
  fetch("http://127.0.0.1:8000/soc/soc-status")
    .then(res => res.json())
    .then(data => setSoc(data))
    .catch(() => {});
}, []);

  /* ===============================
     REAL-TIME STREAM + AUTO-RECONNECT
  ================================ */
  useEffect(() => {
    const connect = () => {
      wsRef.current = new WebSocket("ws://127.0.0.1:8000/ws/soc");

      wsRef.current.onopen = () => {
        console.log("✅ SOC WebSocket connected");
      };

      wsRef.current.onmessage = (event) => {
        console.log("SOC EVENT FROM WS:", event.data);
        const e = JSON.parse(event.data);

        setSoc(prev => ({
          ...prev,
          modules: {
            ...prev.modules,
            [e.module]: e.level === "danger" ? "ALERT" : "ACTIVE"
          },
          events: [e, ...(prev.events || [])].slice(0, 12)
        }));
      };

      wsRef.current.onerror = () => {
        wsRef.current.close();
      };

      wsRef.current.onclose = () => {
        retryRef.current = setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      clearTimeout(retryRef.current);
      wsRef.current && wsRef.current.close();
    };
  }, []);

  return (
    <div className="dashboard-grid">

      {/* ===== OVERVIEW ===== */}
      <div className="module-frame">
        <div className="module-header">
          <h2>🛡️ Security Operations Center</h2>
          <span>✔ System Online</span>
        </div>

        <p style={{ color: "#94a3b8", marginBottom: 16 }}>
          CryptoGuard is actively monitoring cryptographic operations,
          authentication flows, and API security events in real time.
        </p>

        <div className="soc-overview">
          <OverviewCard
            title="Argon2 Password Hashing"
            status={soc.modules.argon2}
            desc="Secure password storage with memory-hard hashing"
          />
          <OverviewCard
            title="AES Encryption"
            status={soc.modules.aes}
            desc="Sensitive data encrypted at rest and in transit"
          />
          <OverviewCard
            title="HMAC Authentication"
            status={soc.modules.hmac}
            desc="API requests authenticated with HMAC-SHA256"
          />
          <OverviewCard
            title="Attack Detection"
            status={soc.modules.attack}
            desc="Replay & tampering attacks actively detected"
            danger={soc.modules.attack === "ALERT"}
          />
        </div>
      </div>

      {/* ===== LIVE EVENTS ===== */}
      <div className="module-frame">
        <div className="module-header">
          <h2>📡 Live Security Events</h2>
          <span>✔ Monitoring</span>
        </div>

        <div className="soc-timeline">
          {soc.events.length === 0 && (
            <Event time="--:--:--">
              Waiting for security activity…
            </Event>
          )}

          {soc.events.map((e, i) => (
            <Event
              key={i}
              time={e.time}
              success={e.level === "success"}
              danger={e.level === "danger"}
            >
              [{e.module?.toUpperCase()}] {e.message}
            </Event>
          ))}
        </div>
      </div>

      {/* ===== PIPELINE ===== */}
      <div className="module-frame">
        <div className="module-header">
          <h2>🔗 Secure Request Pipeline</h2>
          <span>✔ End-to-End Protected</span>
        </div>

        <div className="pipeline">
          <PipelineStep label="User Input" />
          <PipelineStep label="Argon2 Hashing" active={soc.modules.argon2 === "ACTIVE"} />
          <PipelineStep label="AES Encryption" active={soc.modules.aes === "ACTIVE"} />
          <PipelineStep label="HMAC Signing" active={soc.modules.hmac === "ACTIVE"} />
          <PipelineStep label="Secure API" />
        </div>
      </div>
    </div>
  );
}

/* ===============================
   COMPONENTS
================================ */

function OverviewCard({ title, status, desc, danger }) {
  return (
    <div className={`step-card ${danger ? "danger" : ""}`}>
      <div className="step-title">
        {danger ? "⚠" : "✔"} {title}
      </div>
      <div className="step-body">
        <strong>Status:</strong> {status}
        <br />
        <span style={{ color: "#94a3b8" }}>{desc}</span>
      </div>
    </div>
  );
}

function Event({ time, children, success, danger }) {
  return (
    <div className={`event ${success ? "success" : ""} ${danger ? "danger" : ""}`}>
      <span style={{ color: "#94a3b8", fontSize: 12 }}>{time}</span>
      <pre>{children}</pre>
    </div>
  );
}

function PipelineStep({ label, active }) {
  return (
    <div className={`pipeline-step ${active ? "active" : ""}`}>
      <div className="pipeline-dot" />
      <span>{label}</span>
    </div>
  );
}
