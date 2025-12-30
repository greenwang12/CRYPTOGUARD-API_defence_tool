import { createContext, useContext, useState } from "react";

const SecurityContext = createContext();

export function SecurityProvider({ children }) {
  const [security, setSecurity] = useState({
    decision: "ALLOW", // ALLOW | BLOCK
    reason: ""
  });

  return (
    <SecurityContext.Provider value={{ security, setSecurity }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  return useContext(SecurityContext);
}
