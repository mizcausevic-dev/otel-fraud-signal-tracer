# Why We Built This

**otel-fraud-signal-tracer** grew out of a repeated pattern in observability and fraud-adjacent systems: the risk decision was often made upstream, but the downstream services that had to honor or investigate that decision inherited only fragments of the story. A score might exist. A trace might exist. An alert might exist. What was still missing was durable, service-to-service context that kept the fraud narrative intact as the request moved.

That matters because many operational failures in fraud systems are not model failures. They are context failures. A service receives a request, but not the reason it was elevated. An operations team sees an alert, but not the chain of signals that led there. A payment flow is flagged, but the baggage does not survive the system boundary where the next human or service actually needs it. The result is delay, ambiguity, or brittle manual reconstruction.

We built **otel-fraud-signal-tracer** to make that propagation problem explicit. The repo treats W3C Baggage, distributed tracing, and operator review as one system instead of three loosely related topics. The point is not only to show that OpenTelemetry can emit spans. The point is to show how risk context can stay attached to work as it moves through a payments environment.

Existing observability stacks were good at adjacent jobs. They could show service graphs, latency, and errors. They could even show end-to-end trace flows. What they usually did not do by default was preserve business-critical fraud context in a way that remained useful downstream. The missing piece was not instrumentation volume. It was instrumentation intent.

That shaped the design philosophy:

- **context-first** so the fraud story survives system boundaries
- **operator-legible** so downstream teams can act without reassembling evidence manually
- **trace-native** so the design fits modern observability workflows
- **review-friendly** so the repo can support both engineering and risk conversations

This repo also avoids generic observability packaging. It is not trying to be a broad tracing sample with a fraud label attached. It is narrowly focused on the hard part: preserving meaning as requests cross services, tools, and response lanes.

Next on the roadmap is richer downstream alert correlation, better baggage inspection surfaces, and stronger connections into broader governance workflows. The long-term value of **otel-fraud-signal-tracer** is that it makes a subtle but important control problem visible enough to design around before incidents force the lesson.