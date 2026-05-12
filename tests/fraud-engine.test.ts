import test from "node:test";
import assert from "node:assert/strict";
import { simulateFraudTrace } from "../src/fraud-engine.js";
import { resetStore } from "../src/store.js";
import type { FraudSignalInput } from "../src/types.js";

test("high risk payment escalates and preserves baggage", () => {
  resetStore();

  const input: FraudSignalInput = {
    paymentId: "pay_test_9001",
    merchant: "Risky Merchant",
    accountId: "acct_9001",
    amount: 9999,
    currency: "USD",
    deviceFingerprint: "dev-x",
    riskScore: 91,
    ruleTriggers: ["proxy_network", "chargeback_history"],
    issuerRegion: "APAC"
  };

  const result = simulateFraudTrace(input);

  assert.equal(result.record.verdict, "decline");
  assert.equal(result.record.alertState, "escalated");
  assert.match(result.record.baggageHeader, /fraud\.risk_score=91/);
  assert.equal(result.record.spans.length >= 5, true);
});

test("moderate risk payment routes to review", () => {
  resetStore();

  const input: FraudSignalInput = {
    paymentId: "pay_test_9002",
    merchant: "Watch Merchant",
    accountId: "acct_9002",
    amount: 2500,
    currency: "USD",
    deviceFingerprint: "dev-y",
    riskScore: 71,
    ruleTriggers: ["rapid_retries"],
    issuerRegion: "US-East"
  };

  const result = simulateFraudTrace(input);

  assert.equal(result.record.verdict, "review");
  assert.equal(result.record.alertState, "watch");
});
