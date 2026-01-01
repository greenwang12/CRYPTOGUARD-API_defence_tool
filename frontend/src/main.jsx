import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import SOCBackground from "./components/SOCBackground";
import { ThreatProvider } from "./context/useThreat";
import { HmacProvider } from "./context/useHmac";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThreatProvider>
      <HmacProvider>
        <SOCBackground />
        <div className="soc-monitors" />
        <App />
      </HmacProvider>
    </ThreatProvider>
  </React.StrictMode>
);
