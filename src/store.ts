import type { DashboardSummary, TraceRecord } from "./types.js";

const traces: TraceRecord[] = [];

export function resetStore() {
  traces.length = 0;
}

export function addTrace(record: TraceRecord) {
  traces.unshift(record);
}

export function getTraces() {
  return [...traces];
}

export function findTrace(traceId: string) {
  return traces.find((trace) => trace.traceId === traceId);
}

export function dashboardSummary(): DashboardSummary {
  const traceCount = traces.length;
  const elevatedTraces = traces.filter((trace) => trace.alertState !== "quiet").length;
  const declinedPayments = traces.filter((trace) => trace.verdict === "decline").length;
  const avgRiskScore = traceCount === 0 ? 0 : Number((traces.reduce((sum, trace) => sum + trace.riskScore, 0) / traceCount).toFixed(1));
  const baggageCoverage = traceCount === 0
    ? 0
    : Number(((traces.filter((trace) => trace.baggageHeader.length > 0).length / traceCount) * 100).toFixed(1));

  return {
    traceCount,
    elevatedTraces,
    declinedPayments,
    avgRiskScore,
    baggageCoverage,
    leadRecommendation: elevatedTraces > 0
      ? "Keep the baggage trail intact and route elevated payments into the manual-review lane."
      : "The payment path is stable; expand the fraud trace pattern to more services."
  };
}
