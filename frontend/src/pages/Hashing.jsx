import { useState } from "react";
import { hashPassword } from "../api/SecurityApi";

export default function Hashing() {
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [steps, setSteps] = useState(null);
  const [loading, setLoading] = useState(false);

  const runHash = async () => {
    if (!password || loading) return;

    setSteps(null);
    setLoading(true);

    try {
      const res = await hashPassword(password);
      setSteps(res.steps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-frame">
      <div className="module-header">
        <h2>🔐 Password Hashing — Argon2id</h2>
        <span className="badge online">LIVE</span>
      </div>

      <div className="split">
        {/* ================= LEFT PANEL ================= */}
        <div>
          <label>Password Input</label>

          <div style={{ position: "relative" }}>
            <input
              className="soc-input"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPwd(!showPwd)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer"
              }}
            >
             {showPwd? (
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

          <button onClick={runHash} disabled={loading || !password}>
            {loading ? "Hashing…" : "Hash Password"}
          </button>

          {/* LEFT — STEP CARDS */}
          <Step
            title="Step 1: Argon2id"
            value={steps?.salt}
            pending={loading && !steps?.salt}
          />

          <Step
            title="Step 2: Hashing Parameters"
            value={
              steps?.params &&
              `Algorithm: Argon2id
Memory: ${steps.params.memory / 1024} MB
Iterations: ${steps.params.iterations}
Parallelism: ${steps.params.parallelism}`
            }
            pending={loading && !steps?.params}
          />

          <Step
            title="Step 3: Hash Computation"
            value={steps?.hash}
            pending={loading && !steps?.hash}
          />
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div>
          <Step
            title="Step 1: Salt Generated"
            value={steps?.salt}
            pending={loading && !steps?.salt}
          />

          <Step
            title="Step 2: Hashing Parameters"
            value={
              steps?.params &&
              `Argon2id ✓
Memory: ${steps.params.memory / 1024} MB
Iterations: ${steps.params.iterations}
Parallelism: ${steps.params.parallelism}`
            }
            pending={loading && !steps?.params}
          />

          <Step
            title="Step 3: Hash Computation"
            value={steps?.hash}
            pending={loading && !steps?.hash}
          />

          {steps && (
            <div className="step-card success">
              <div className="step-title">✔ Password securely hashed</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Step({ title, value, pending }) {
  return (
    <div className="step-card">
      <div className="step-title">✔ {title}</div>

      <div className="step-body">
        {value && <pre>{value}</pre>}
        {!value && pending && <span>Processing…</span>}
        {!value && !pending && <span>Waiting…</span>}
      </div>
    </div>
  );
}
