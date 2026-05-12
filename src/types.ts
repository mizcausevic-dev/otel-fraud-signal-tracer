export type FraudSignalInput = {
  paymentId: string;
  merchant: string;
  accountId: string;
  amount: number;
  currency: string;
  deviceFingerprint: string;
  riskScore: number;
  ruleTriggers: string[];
  issuerRegion: string;
};

export type SpanSummary = {
  name: string;
  service: string;
  durationMs: number;
  riskScore: string;
  triggers: string;
  status: string;
};

export type TraceRecord = {
  traceId: string;
  paymentId: string;
  merchant: string;
  riskScore: number;
  verdict: "allow" | "review" | "decline";
  alertState: "quiet" | "watch" | "escalated";
  baggageHeader: string;
  triggerSummary: string;
  createdAt: string;
  spans: SpanSummary[];
};

export type DashboardSummary = {
  traceCount: number;
  elevatedTraces: number;
  declinedPayments: number;
  avgRiskScore: number;
  baggageCoverage: number;
  leadRecommendation: string;
};

export type SimulationResult = {
  record: TraceRecord;
  dashboard: DashboardSummary;
};
