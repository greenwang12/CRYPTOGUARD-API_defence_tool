import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import SOCBackground from "./components/SOCBackground";
import ThreatProvider from "./context/ThreatProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThreatProvider>
      <SOCBackground />
      <div className="soc-monitors" />
      <App />
    </ThreatProvider>
  </React.StrictMode>
);
