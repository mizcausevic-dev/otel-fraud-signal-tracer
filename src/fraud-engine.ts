import {
  baggageEntryMetadataFromString,
  context,
  propagation,
  SpanStatusCode,
  trace,
  type Context
} from "@opentelemetry/api";
import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";
import { spanExporter } from "./telemetry.js";
import { addTrace, dashboardSummary } from "./store.js";
import type { FraudSignalInput, SimulationResult, SpanSummary, TraceRecord } from "./types.js";

const tracer = trace.getTracer("fraud-signal-tracer");

function baggageForSignal(signal: FraudSignalInput): Context {
  const baggage = propagation.createBaggage({
    "fraud.risk_score": {
      value: String(signal.riskScore),
      metadata: baggageEntryMetadataFromString("payment-risk")
    },
    "fraud.rule_triggers": {
      value: signal.ruleTriggers.join("|"),
      metadata: baggageEntryMetadataFromString("trigger-list")
    },
    "fraud.payment_id": {
      value: signal.paymentId,
      metadata: baggageEntryMetadataFromString("payment-id")
    },
    "fraud.issuer_region": {
      value: signal.issuerRegion,
      metadata: baggageEntryMetadataFromString("issuer-region")
    }
  });
  return propagation.setBaggage(context.active(), baggage);
}

function baggageCarrier(ctx: Context) {
  const carrier: Record<string, string> = {};
  propagation.inject(ctx, carrier);
  return carrier;
}

function summarizeSpans(spans: ReadableSpan[]): SpanSummary[] {
  return spans.map((span) => ({
    name: span.name,
    service: String(span.attributes["service.name"] ?? "payment-runtime"),
    durationMs: Number(((span.endTime[0] - span.startTime[0]) * 1000 + (span.endTime[1] - span.startTime[1]) / 1_000_000).toFixed(2)),
    riskScore: String(span.attributes["fraud.risk_score"] ?? "n/a"),
    triggers: String(span.attributes["fraud.rule_triggers"] ?? "n/a"),
    status: span.status.code === SpanStatusCode.OK ? "ok" : span.status.code === SpanStatusCode.ERROR ? "error" : "unset"
  }));
}

function serviceStep<T>(ctx: Context, serviceName: string, spanName: string, fn: () => T): T {
  return tracer.startActiveSpan(spanName, { attributes: { "service.name": serviceName } }, ctx, (span) => {
    const baggage = propagation.getBaggage(context.active());
    span.setAttribute("fraud.risk_score", baggage?.getEntry("fraud.risk_score")?.value ?? "0");
    span.setAttribute("fraud.rule_triggers", baggage?.getEntry("fraud.rule_triggers")?.value ?? "");
    span.setAttribute("fraud.payment_id", baggage?.getEntry("fraud.payment_id")?.value ?? "");
    try {
      const result = fn();
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      return result;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: error instanceof Error ? error.message : String(error) });
      span.end();
      throw error;
    }
  });
}

export function simulateFraudTrace(signal: FraudSignalInput): SimulationResult {
  const before = spanExporter.getFinishedSpans().length;
  const baseCtx = baggageForSignal(signal);
  let verdict: TraceRecord["verdict"] = "allow";
  let alertState: TraceRecord["alertState"] = "quiet";
  let traceId = "";

  tracer.startActiveSpan("payment-ingest", { attributes: { "service.name": "payments-ingest" } }, baseCtx, (rootSpan) => {
    traceId = rootSpan.spanContext().traceId;
    rootSpan.setAttribute("payment.id", signal.paymentId);
    rootSpan.setAttribute("merchant.name", signal.merchant);
    rootSpan.setAttribute("payment.amount", signal.amount);
    rootSpan.setAttribute("payment.currency", signal.currency);

    serviceStep(context.active(), "fraud-score-engine", "fraud-score", () => {
      if (signal.riskScore >= 85) {
        verdict = "decline";
        alertState = "escalated";
      } else if (signal.riskScore >= 65) {
        verdict = "review";
        alertState = "watch";
      }
    });

    serviceStep(context.active(), "policy-gateway", "policy-route", () => {
      rootSpan.setAttribute("fraud.verdict", verdict);
    });

    serviceStep(context.active(), "issuer-authorization", "issuer-auth", () => {
      if (verdict === "decline") {
        rootSpan.addEvent("authorization_stopped_by_fraud_lane");
      }
    });

    serviceStep(context.active(), "payment-ledger", "ledger-write", () => {
      rootSpan.addEvent("event_written_to_payment_ledger");
    });

    serviceStep(context.active(), "alert-fanout", "alert-fanout", () => {
      if (alertState !== "quiet") {
        rootSpan.addEvent("fraud_alert_published");
      }
    });

    rootSpan.setStatus({ code: SpanStatusCode.OK });
    rootSpan.end();
  });

  const spans = spanExporter.getFinishedSpans().slice(before).filter((span) => span.spanContext().traceId === traceId);
  const summary = summarizeSpans(spans);
  const carrier = baggageCarrier(baseCtx);
  const record: TraceRecord = {
    traceId,
    paymentId: signal.paymentId,
    merchant: signal.merchant,
    riskScore: signal.riskScore,
    verdict,
    alertState,
    baggageHeader: carrier.baggage ?? "",
    triggerSummary: signal.ruleTriggers.join(", "),
    createdAt: new Date().toISOString(),
    spans: summary
  };

  addTrace(record);

  return {
    record,
    dashboard: dashboardSummary()
  };
}
