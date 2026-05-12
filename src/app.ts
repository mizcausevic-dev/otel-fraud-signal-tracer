import express from "express";
import { simulateFraudTrace } from "./fraud-engine.js";
import { renderDocs, renderOverview, renderTraceBoard } from "./render.js";
import { ensureSeededTraces } from "./seed.js";
import { dashboardSummary, getTraces } from "./store.js";
import type { FraudSignalInput } from "./types.js";

export function createApp() {
  ensureSeededTraces();

  const app = express();
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.type("html").send(renderOverview());
  });

  app.get("/traces", (_req, res) => {
    res.type("html").send(renderTraceBoard());
  });

  app.get("/docs", (_req, res) => {
    res.type("html").send(renderDocs());
  });

  app.get("/api/dashboard/summary", (_req, res) => {
    res.json({
      dashboard: dashboardSummary(),
      traces: getTraces().slice(0, 2).map((trace) => ({
        traceId: trace.traceId,
        paymentId: trace.paymentId,
        merchant: trace.merchant,
        riskScore: trace.riskScore,
        verdict: trace.verdict,
        alertState: trace.alertState
      }))
    });
  });

  app.get("/api/traces", (_req, res) => {
    res.json(getTraces());
  });

  app.get("/api/sample", (_req, res) => {
    res.json(getTraces()[0]);
  });

  app.post("/api/simulate", (req, res) => {
    const signal = req.body as FraudSignalInput;
    const result = simulateFraudTrace(signal);
    res.status(202).json(result);
  });

  return app;
}
