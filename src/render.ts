import { dashboardSummary, getTraces } from "./store.js";

function escape(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function page(title: string, body: string) {
  return `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escape(title)}</title>
    <style>
      :root{--bg:#07111d;--panel:#121f32;--line:#29486e;--text:#eef3ff;--muted:#9db0cc;--accent:#8ecbff;--accent2:#ffe0ae;--good:#8ff2b7;--warn:#ffd37d;--danger:#ff9d9d}
      *{box-sizing:border-box}body{margin:0;font-family:Inter,Segoe UI,sans-serif;background:radial-gradient(circle at top left,rgba(90,132,199,.22),transparent 28%),linear-gradient(180deg,#05101b,#091523);color:var(--text)}
      main{width:min(1320px,calc(100% - 48px));margin:24px auto;padding:30px;border-radius:28px;border:1px solid rgba(73,105,150,.4);background:rgba(8,16,28,.9)}
      nav{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:22px}
      nav strong,.eyebrow{color:var(--accent);letter-spacing:.28em;text-transform:uppercase;font-size:13px}
      nav a{color:var(--text);text-decoration:none;border:1px solid rgba(73,105,150,.36);padding:10px 14px;border-radius:999px;background:rgba(18,31,49,.7);font-size:13px}
      h1{margin:8px 0 14px;font-family:Georgia,serif;font-size:68px;line-height:.94;letter-spacing:-.05em}
      .lede{max-width:900px;font-size:22px;line-height:1.5;color:var(--muted)}
      .metrics,.trace-grid,.span-grid{display:grid;gap:18px}
      .metrics{grid-template-columns:repeat(4,1fr);margin:28px 0}
      .trace-grid{grid-template-columns:repeat(3,1fr);margin-top:22px}
      .span-grid{grid-template-columns:repeat(2,1fr);margin-top:18px}
      .card,.callout,.trace-card,.span-card{background:linear-gradient(180deg,rgba(19,33,53,.96),rgba(16,28,47,.96));border:1px solid rgba(73,105,150,.34);border-radius:24px;padding:18px}
      .card strong,.callout strong{display:block;margin:10px 0 8px;font-family:Georgia,serif;color:var(--accent2)}
      .card strong{font-size:52px;line-height:1}.callout strong{font-size:42px;line-height:1.02}
      .card p,.callout p,.trace-card p,.span-card p,.trace-card li,.span-card li{color:var(--muted);line-height:1.5}
      .trace-card h3,.span-card h4{margin:10px 0;font-family:Georgia,serif;color:var(--accent2);font-size:28px;line-height:1.06}
      .tag{display:inline-block;padding:7px 11px;border-radius:999px;background:rgba(57,83,120,.58);font-size:12px;letter-spacing:.08em;text-transform:uppercase}
      .ok{color:var(--good)}.watch{color:var(--warn)}.decline{color:var(--danger)}
      .panel{margin:24px 0;padding:20px;border-radius:28px;border:1px solid rgba(73,105,150,.25);background:rgba(10,18,31,.72)}
      .panel h2{margin:10px 0 0;font-family:Georgia,serif;font-size:48px;line-height:1.02}
      .mono{font-family:Consolas,Monaco,monospace;font-size:14px;word-break:break-all}
      table{width:100%;border-collapse:collapse;margin-top:16px;overflow:hidden;border-radius:20px}
      th,td{padding:16px;border-bottom:1px solid rgba(73,105,150,.25);text-align:left;vertical-align:top}
      th{color:var(--accent);font-size:12px;letter-spacing:.18em;text-transform:uppercase}
      @media (max-width:1024px){.metrics,.trace-grid,.span-grid{grid-template-columns:repeat(2,1fr)}}
      @media (max-width:720px){main{width:calc(100% - 24px);padding:18px}.metrics,.trace-grid,.span-grid{grid-template-columns:1fr}}
    </style>
  </head>
  <body>
    <main>
      <nav>
        <strong>OTEL FRAUD SIGNAL TRACER</strong>
        <div>
          <a href="/">Overview</a>
          <a href="/traces">Trace Board</a>
          <a href="/docs">Docs</a>
          <a href="/api/dashboard/summary">API summary</a>
        </div>
      </nav>
      ${body}
    </main>
  </body>
  </html>`;
}

export function renderOverview() {
  const dashboard = dashboardSummary();
  const latest = getTraces().slice(0, 3);
  return page(
    "OTel Fraud Signal Tracer",
    `<p class="eyebrow">Fraud context correlation</p>
     <h1>Risk score and rule triggers stay attached as the payment moves.</h1>
     <p class="lede">This demo pushes fraud scoring context as W3C Baggage through a payment ingest lane, issuer authorization path, ledger write, and alert fanout path so downstream teams can correlate anomalies without guessing what the original risk engine knew.</p>
     <section class="metrics">
       <article class="card"><p>Captured traces</p><strong>${dashboard.traceCount}</strong><p>Seeded flows plus any locally simulated payment runs.</p></article>
       <article class="card"><p>Elevated traces</p><strong>${dashboard.elevatedTraces}</strong><p>Flows that produced watch or escalated alert behavior.</p></article>
       <article class="card"><p>Declined payments</p><strong>${dashboard.declinedPayments}</strong><p>High-risk runs that should never reach issuer authorization cleanly.</p></article>
       <article class="card"><p>Baggage coverage</p><strong>${dashboard.baggageCoverage}%</strong><p>How often payment risk baggage survives end to end.</p></article>
     </section>
     <section class="callout">
       <p class="eyebrow">Lead decision</p>
       <strong>${escape(dashboard.leadRecommendation)}</strong>
       <p>The point is not just that traces exist. The point is that fraud context survives the path from score generation to response orchestration.</p>
     </section>
     <section class="panel">
       <p class="eyebrow">Latest traces</p>
       <h2>Operator-facing proof that baggage is not getting lost.</h2>
       <div class="trace-grid">
         ${latest.map((trace) => `<article class="trace-card">
            <span class="tag ${trace.alertState === "quiet" ? "ok" : trace.alertState === "watch" ? "watch" : "decline"}">${escape(trace.alertState)}</span>
            <h3>${escape(trace.merchant)}</h3>
            <p>Payment <span class="mono">${escape(trace.paymentId)}</span> ran with risk score <strong>${trace.riskScore}</strong> and a <strong>${escape(trace.verdict)}</strong> verdict.</p>
            <p>${escape(trace.triggerSummary)}</p>
            <p class="mono">${escape(trace.baggageHeader)}</p>
         </article>`).join("")}
       </div>
     </section>`
  );
}

export function renderTraceBoard() {
  const traces = getTraces();
  return page(
    "Trace Board",
    `<p class="eyebrow">Trace board</p>
     <h1>Each service step can still see the fraud story it inherited.</h1>
     <p class="lede">The spans below show how baggage survives each service handoff. This is what makes downstream alerts explainable instead of mysterious.</p>
     ${traces.map((trace) => `<section class="panel">
       <span class="tag ${trace.alertState === "quiet" ? "ok" : trace.alertState === "watch" ? "watch" : "decline"}">${escape(trace.verdict)} • risk ${trace.riskScore}</span>
       <h2>${escape(trace.merchant)} • ${escape(trace.paymentId)}</h2>
       <p class="mono">${escape(trace.baggageHeader)}</p>
       <div class="span-grid">
         ${trace.spans.map((span) => `<article class="span-card">
           <h4>${escape(span.name)}</h4>
           <p>Service: ${escape(span.service)}</p>
           <p>Duration: ${span.durationMs} ms</p>
           <p>Risk baggage: ${escape(span.riskScore)}</p>
           <p>Triggers: ${escape(span.triggers)}</p>
         </article>`).join("")}
       </div>
     </section>`).join("")}`
  );
}

export function renderDocs() {
  return page(
    "Docs",
    `<p class="eyebrow">Runtime + integration</p>
     <h1>Runs instantly in memory, then grows into a collector-backed trace pipeline.</h1>
     <p class="lede">Local-first mode uses an in-memory exporter so the app stays one-shot friendly. The repo also ships with a collector and Jaeger path for teams that want to see the same fraud context in a broader observability stack.</p>
     <section class="panel">
       <p class="eyebrow">Key routes</p>
       <h2>Small API surface, clear proof.</h2>
       <table>
         <thead><tr><th>Route</th><th>Purpose</th></tr></thead>
         <tbody>
           <tr><td><span class="mono">GET /api/dashboard/summary</span></td><td>Returns trace counts, alert posture, average risk score, and baggage coverage.</td></tr>
           <tr><td><span class="mono">GET /api/traces</span></td><td>Returns captured trace records with span summaries and the baggage header.</td></tr>
           <tr><td><span class="mono">GET /api/sample</span></td><td>Returns the latest seeded or simulated trace for fast smoke checks.</td></tr>
           <tr><td><span class="mono">POST /api/simulate</span></td><td>Accepts a payment risk payload and emits a fresh correlated trace.</td></tr>
         </tbody>
       </table>
     </section>
     <section class="callout">
       <p class="eyebrow">Compose story</p>
       <strong>Collector + Jaeger are optional, not required to understand the repo.</strong>
       <p>The application works immediately on its own, then the Docker Compose profile adds a local observability lane for collector-driven exports.</p>
     </section>`
  );
}
