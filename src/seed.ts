import { seededSignals } from "./sample-data.js";
import { simulateFraudTrace } from "./fraud-engine.js";
import { getTraces } from "./store.js";

let seeded = false;

export function ensureSeededTraces() {
  if (seeded || getTraces().length > 0) {
    return;
  }

  for (const signal of seededSignals) {
    simulateFraudTrace(signal);
  }

  seeded = true;
}
