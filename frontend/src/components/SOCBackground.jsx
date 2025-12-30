import { useEffect, useRef } from "react";
import { useThreat } from "../context/useThreat";

export default function SOCBackground() {
  const canvasRef = useRef(null);
  const { threat } = useThreat();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let t = 0;

    /* ===============================
       HEARTBEAT PARAMETERS
    =============================== */
    let beatHeight = 90;
    let beatWidth = 24;
    let nextChange = 0;

    /* ===============================
       THREAT → VISUAL PROFILE
    =============================== */
    const threatProfile = {
  normal: {
    speed: 2.0,
    amp: 1.0,
    core: "rgba(210,255,235,0.95)",
    glow: "rgba(34,197,94,0.25)",
  },
  attack: {
    speed: 3.6,
    amp: 1.6,
    core: "rgba(255,235,170,0.95)",
    glow: "rgba(234,179,8,0.35)",
  },
  tamper: {
    speed: 5.5,
    amp: 2.2,
    core: "rgba(255,170,170,0.95)",
    glow: "rgba(239,68,68,0.45)",
  },
};

    /* ===============================
       CINEMATIC ECG (UPWARD DOMINANT)
       - asymmetric
       - no crossing
       - single signal
    =============================== */
    const ecg = (x) => {
      const p = (x + t) % 260;

      // Slight beat variation
      if (p < 2 && t > nextChange) {
        beatHeight = 85 + Math.random() * 30;
        beatWidth = 22 + Math.random() * 10;
        nextChange = t + 240;
      }

      // ---- MAIN SHAPE ----
      if (p < 8) return -6 * (p / 8);                         // tiny dip
      if (p < 14) return beatHeight * (p - 8) / 6;            // FAST UP
      if (p < beatWidth)
        return beatHeight - (p - 14) * (beatHeight / (beatWidth - 14)); // slow fall
      if (p < beatWidth + 16)
        return -18 * Math.exp(-(p - beatWidth) / 5);          // recovery

      // ---- SAFE BASELINE ----
      return Math.sin((x + t) / 180) * 1.4;
    };

    /* ===============================
       DRAW ONE PATH ONLY
    =============================== */
    const drawPath = (amp) => {
      const midY = canvas.height * 0.56;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 4) {
        const y = midY + ecg(x) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    };

    const draw = () => {
      const cfg = threatProfile[threat] || threatProfile.normal;

      /* ---- FADE ---- */
      ctx.fillStyle = "rgba(2,6,23,0.28)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      /* ---- LIGHT NOISE ---- */
      ctx.fillStyle = "rgba(56,189,248,0.008)";
      for (let i = 0; i < 80; i++) {
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          1,
          1
        );
      }

      /* ---- HALO (VERY SOFT) ---- */
      drawPath(cfg.amp);
      ctx.lineWidth = 6;
      ctx.strokeStyle = cfg.glow;
      ctx.shadowColor = cfg.glow;
      ctx.shadowBlur = 40;
      ctx.stroke();

      /* ---- CORE SIGNAL ---- */
      drawPath(cfg.amp);
      ctx.lineWidth = 2;
      ctx.strokeStyle = cfg.core;
      ctx.shadowColor = cfg.core;
      ctx.shadowBlur = 12;
      ctx.stroke();

      ctx.shadowBlur = 0;

      /* ---- SCAN LINE ---- */
      ctx.fillStyle = cfg.glow;
      ctx.globalAlpha = 0.06;
      ctx.fillRect(0, (t * 1.1) % canvas.height, canvas.width, 2);
      ctx.globalAlpha = 1;

      t += cfg.speed;
      requestAnimationFrame(draw);
    };

    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw();

    return () => window.removeEventListener("resize", resize);
  }, [threat]);

  return <canvas id="soc-canvas" ref={canvasRef} />;
}
