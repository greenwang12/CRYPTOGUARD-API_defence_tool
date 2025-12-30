export default function Splash() {
  return (
    <>
      <style>{`
        .splash {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #020617;
          overflow: hidden;

          animation: splashOut 0.9s ease forwards;
          animation-delay: 3.2s;
        }

        .splash img {
          width: 100vw;
          height: 100vh;
          object-fit: cover;

          animation:
            splashIn 1.4s ease-out,
            glowPulse 2.6s ease-in-out infinite alternate;

          filter: brightness(1.05)
                  drop-shadow(0 0 40px rgba(56,189,248,0.55));
        }

        .boot-ui {
          position: absolute;
          bottom: 12%;
          left: 50%;
          transform: translateX(-50%);
          width: 42%;
          min-width: 320px;
          text-align: center;
          font-family: system-ui, monospace;
        }

        .boot-text {
          color: #a5f3fc;
          letter-spacing: 2px;
          font-size: 13px;
          margin-bottom: 12px;
          opacity: 0.9;
        }

        .boot-bar {
          height: 4px;
          background: rgba(56,189,248,0.15);
          border-radius: 4px;
          overflow: hidden;
        }

        .boot-bar span {
          display: block;
          height: 100%;
          width: 0%;
          background: linear-gradient(
            90deg,
            #38bdf8,
            #22c55e
          );
          animation: load 3s ease-out forwards;
        }

        /* ENTRY */
        @keyframes splashIn {
          from {
            opacity: 0;
            transform: scale(1.04);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* GLOW */
        @keyframes glowPulse {
          from {
            filter: brightness(1.0)
                    drop-shadow(0 0 28px rgba(56,189,248,0.35));
          }
          to {
            filter: brightness(1.08)
                    drop-shadow(0 0 60px rgba(56,189,248,0.75));
          }
        }

        /* LOADING BAR */
        @keyframes load {
          to {
            width: 100%;
          }
        }

        /* EXIT */
        @keyframes splashOut {
          to {
            opacity: 0;
            transform: scale(1.02);
            visibility: hidden;
          }
        }
      `}</style>

      <div className="splash">
        <img
          src="/cryptoguard.png"
          alt="CryptoGuard"
        />

        <div className="boot-ui">
          <div className="boot-text">
            INITIALIZING SECURITY MODULES…
          </div>
          <div className="boot-bar">
            <span />
          </div>
        </div>
      </div>
    </>
  );
}
