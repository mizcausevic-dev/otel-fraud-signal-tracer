# Architecture

## Core idea

Fraud scoring often happens early, but the reasons behind the score disappear as the payment moves through downstream services.

This repo keeps that context attached:

- `fraud.risk_score`
- `fraud.rule_triggers`
- `fraud.payment_id`
- `fraud.issuer_region`

Those values are carried as W3C Baggage so policy, authorization, ledger, and alerting services can all see the same decision context.

## Runtime shape

The local-first runtime is deliberately simple:

1. express app starts immediately
2. OTel Node tracer provider registers
3. in-memory exporter captures finished spans
4. trace summaries are materialized into an operator-facing store
5. HTML and JSON surfaces expose the result

## Service path

- `payments-ingest`
- `fraud-score-engine`
- `policy-gateway`
- `issuer-authorization`
- `payment-ledger`
- `alert-fanout`

## Why it matters

This makes observability relevant to fraud and payments leaders:

- support can explain why a payment was held
- fraud ops can see which rules fired
- downstream teams do not need to re-query a separate scoring system
- alerting can carry the same trace and baggage story

## Optional collector path

The repo also includes a lightweight collector + Jaeger stack for teams that want to extend the same demo into a more standard observability topology.
