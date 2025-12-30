import { useContext } from "react";
import { ThreatContext } from "./threatContext";

export function useThreat() {
  const ctx = useContext(ThreatContext);
  if (!ctx) {
    throw new Error("useThreat must be used inside ThreatProvider");
  }

  return {
    ...ctx,
    isBlocked: ctx.threat !== "normal" // 👈 THIS IS THE KEY
  };
}
