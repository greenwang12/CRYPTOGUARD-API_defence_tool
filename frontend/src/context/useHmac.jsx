import { createContext, useContext, useState } from "react";

const HmacContext = createContext(null);

export function HmacProvider({ children }) {
  const [lastAuth, setLastAuth] = useState(null);

  return (
    <HmacContext.Provider value={{ lastAuth, setLastAuth }}>
      {children}
    </HmacContext.Provider>
  );
}

export function useHmac() {
  const ctx = useContext(HmacContext);
  if (!ctx) {
    throw new Error("useHmac must be used inside HmacProvider");
  }
  return ctx;
}
