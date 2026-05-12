import { propagation } from "@opentelemetry/api";
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from "@opentelemetry/core";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { InMemorySpanExporter, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: "otel-fraud-signal-tracer"
});

const exporter = new InMemorySpanExporter();
const provider = new NodeTracerProvider({
  resource,
  spanProcessors: [new SimpleSpanProcessor(exporter)]
});
provider.register();
propagation.setGlobalPropagator(new CompositePropagator({
  propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()]
}));

export const tracerProvider = provider;
export const spanExporter = exporter;
