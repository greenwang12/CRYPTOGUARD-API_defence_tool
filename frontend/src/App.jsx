import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Hashing from "./pages/Hashing";
import Encryption from "./pages/Encryption";
import Hmac from "./pages/Hmac";
import Attack from "./pages/Attack";
import Splash from "./components/Splash";
import { useThreat } from "./context/useThreat";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const { setThreat } = useThreat();

  /* ===============================
     SPLASH TIMER
  ================================ */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(t);
  }, []);

  /* ===============================
     THREAT CONTROL
  ================================ */
  const calmDown = (delay = 4000) => {
    setTimeout(() => setThreat("normal"), delay);
  };

  const triggerAttack = () => {
    setThreat("attack");
    calmDown(4000);
  };

  const triggerTamper = () => {
    setThreat("tamper");
    calmDown(6000);
  };

  /* ===============================
     PAGE RENDER
  ================================ */
  const render = () => {
    if (page === "hash") return <Hashing />;
    if (page === "encrypt") return <Encryption />;
    if (page === "hmac") return <Hmac />;
    if (page === "attack")
      return (
        <Attack
          onReplay={triggerAttack}
          onTamper={triggerTamper}
        />
      );
    return <Dashboard />;
  };

  /* ===============================
     SPLASH FIRST
  ================================ */
  if (loading) return <Splash />;

  return (
    <div className="soc-layout app-ui">
      <Sidebar setPage={setPage} />
      <main className="soc-main">{render()}</main>
    </div>
  );
}
