import type { FraudSignalInput } from "./types.js";

export const seededSignals: FraudSignalInput[] = [
  {
    paymentId: "pay_nt_1001",
    merchant: "Northstar Treasury",
    accountId: "acct_nt_4821",
    amount: 18420.55,
    currency: "USD",
    deviceFingerprint: "dev-44c1-nt",
    riskScore: 44,
    ruleTriggers: ["geo_velocity", "new_device"],
    issuerRegion: "US-East"
  },
  {
    paymentId: "pay_bh_1098",
    merchant: "BlueHarbor Capital",
    accountId: "acct_bh_3320",
    amount: 92100,
    currency: "USD",
    deviceFingerprint: "dev-91b7-bh",
    riskScore: 77,
    ruleTriggers: ["rapid_retries", "high_amount", "mcc_mismatch"],
    issuerRegion: "EU-West"
  },
  {
    paymentId: "pay_ap_1104",
    merchant: "AnchorPay Processing",
    accountId: "acct_ap_9021",
    amount: 410500.12,
    currency: "USD",
    deviceFingerprint: "dev-12af-ap",
    riskScore: 93,
    ruleTriggers: ["chargeback_history", "proxy_network", "device_rotation"],
    issuerRegion: "LATAM"
  }
];
