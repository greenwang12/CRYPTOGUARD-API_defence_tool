import { createContext, useContext, useState } from "react";

const ThreatContext = createContext(null);

export function ThreatProvider({ children }) {
  const [threat, setThreat] = useState("normal");

  return (
    <ThreatContext.Provider value={{ threat, setThreat }}>
      {children}
    </ThreatContext.Provider>
  );
}

export function useThreat() {
  const ctx = useContext(ThreatContext);
  if (!ctx) {
    throw new Error("useThreat must be used inside ThreatProvider");
  }
  return ctx;
}
