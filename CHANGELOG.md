# Changelog

All notable changes to this project are documented here.

## [1.0.0] - 2026-05-12

### Released
- Published **otel-fraud-signal-tracer** as the observability layer of the fintech cluster.
- Packaged W3C Baggage propagation, fraud context continuity, trace-to-alert storytelling, and collector configuration into one public repo.
- Clarified the operating problem: fraud signals often degrade when context crosses service boundaries.

### Why this mattered
- Plenty of teams can emit traces. Fewer can preserve risk context in a way investigators and operators can use immediately.
- Generic tracing setups rarely make fraud decisions legible once requests fan out across services.
- This release made the repo relevant to observability, fraud, and platform teams at the same time.

## [0.1.0] - 2026-02-26

### Shipped
- Cut the first coherent model for fraud baggage, service-to-service trace continuity, and operator review surfaces.
- Added the first public-facing verification flow for inspecting propagated risk context.

## [Prototype] - 2025-04-15

### Built
- Prototyped trace propagation around fraud score continuity, rule-trigger context, and downstream alertability.
- Used the prototype to test whether observability could tell a better business story than raw trace spans alone.

## [Design Phase] - 2024-02-14

### Designed
- Treated baggage propagation as a business-control problem, not just a tracing feature.
- Kept the design anchored in operator review, not observability theater.
- Framed the repo around context preservation across service boundaries.

## [Idea Origin] - 2023-05-27

### Observed
- The idea emerged from repeated cases where downstream teams inherited risk decisions without inheriting enough context to act confidently.
- The missing layer was a trace system that preserved the fraud story, not just the request path.