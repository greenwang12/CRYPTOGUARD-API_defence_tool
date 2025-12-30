import { useState } from "react";
import { ThreatContext } from "./threatContext";

export default function ThreatProvider({ children }) {
  const [threat, setThreat] = useState("normal");

  return (
    <ThreatContext.Provider value={{ threat, setThreat }}>
      {children}
    </ThreatContext.Provider>
  );
}
