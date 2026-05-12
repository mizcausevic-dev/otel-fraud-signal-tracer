import { dashboardSummary, getTraces } from "./store.js";
import type { TraceRecord } from "./types.js";

function escape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatRouteLabel(route: string) {
  if (route === "overview") {
    return "OVERVIEW LANE";
  }

  if (route === "docs") {
    return "DOCS LANE";
  }

  if (route === "verification") {
    return "VERIFICATION LANE";
  }

  return "TRACE BOARD";
}

function badgeTone(state: "quiet" | "watch" | "escalated") {
  if (state === "quiet") {
    return "good";
  }

  if (state === "watch") {
    return "warn";
  }

  return "danger";
}

function verdictCopy(trace: TraceRecord) {
  if (trace.verdict === "decline") {
    return "Manual payment controls should stay active and the charge should not settle automatically.";
  }

  if (trace.verdict === "review") {
    return "The risk posture is elevated enough to route the payment into analyst review before ledger finalization.";
  }

  return "The payment path stayed stable enough to proceed while preserving the trace context for post-fact analysis.";
}

function nav(current: "overview" | "traces" | "docs" | "verification") {
  const items = [
    { href: "/", label: "Overview", key: "overview" },
    { href: "/traces", label: "Trace Board", key: "traces" },
    { href: "/docs", label: "Docs", key: "docs" },
    { href: "/verification", label: "Verification", key: "verification" }
  ];

  return items
    .map((item) => `<a class="${current === item.key ? "active" : ""}" href="${item.href}">${item.label}</a>`)
    .join("");
}

function shell(title: string, current: "overview" | "traces" | "docs" | "verification", body: string) {
  const dashboard = dashboardSummary();
  const latest = getTraces()[0];

  return `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escape(title)}</title>
    <style>
      :root{
        --bg:#06101b;
        --shell:#0d1623;
        --panel:#111d2d;
        --panel-2:#18263b;
        --line:rgba(104,140,196,.24);
        --text:#eef4ff;
        --muted:#9fb3d2;
        --muted-2:#7e92b5;
        --accent:#78c1ff;
        --accent-soft:rgba(120,193,255,.16);
        --gold:#f4e6c8;
        --good:#8fe3ba;
        --warn:#ffd380;
        --danger:#ff9c93;
      }
      *{box-sizing:border-box}
      body{
        margin:0;
        font-family:Inter,Segoe UI,Arial,sans-serif;
        color:var(--text);
        background:
          radial-gradient(circle at top left, rgba(62,112,180,.26), transparent 30%),
          linear-gradient(180deg, #05101a 0%, #081320 100%);
      }
      .shell{
        width:min(1480px,calc(100% - 40px));
        margin:20px auto;
        padding:22px;
        border:1px solid var(--line);
        border-radius:30px;
        background:linear-gradient(180deg, rgba(10,18,31,.96), rgba(8,15,27,.98));
        box-shadow:0 30px 80px rgba(0,0,0,.28);
      }
      .topbar{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:16px;
        padding:12px 14px;
        margin-bottom:18px;
        border:1px solid rgba(104,140,196,.18);
        border-radius:22px;
        background:linear-gradient(180deg, rgba(18,29,46,.88), rgba(10,18,31,.84));
      }
      .brand{
        display:flex;
        align-items:center;
        gap:14px;
        flex-wrap:wrap;
      }
      .brand-mark{
        letter-spacing:.28em;
        text-transform:uppercase;
        color:var(--accent);
        font-size:12px;
        font-weight:700;
      }
      .brand-route{
        color:var(--muted);
        font-size:13px;
        letter-spacing:.14em;
        text-transform:uppercase;
      }
      .status-strip{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        justify-content:flex-end;
      }
      .chip{
        padding:8px 12px;
        border-radius:999px;
        border:1px solid rgba(104,140,196,.2);
        background:rgba(24,38,59,.82);
        color:var(--text);
        font-size:12px;
        font-weight:600;
      }
      .chip span{
        color:var(--muted);
        margin-right:6px;
      }
      .hero{
        display:grid;
        grid-template-columns:1.5fr .95fr;
        gap:18px;
        margin-bottom:20px;
      }
      .hero-copy,.hero-side,.panel,.callout,.trace-card,.span-card,.metric{
        border:1px solid var(--line);
        border-radius:28px;
        background:linear-gradient(180deg, rgba(20,32,50,.92), rgba(13,23,38,.95));
      }
      .hero-copy,.hero-side,.panel,.callout{
        padding:28px;
      }
      .eyebrow{
        color:var(--accent);
        letter-spacing:.28em;
        text-transform:uppercase;
        font-size:12px;
        font-weight:700;
      }
      h1{
        margin:14px 0 16px;
        font-family:Georgia,"Times New Roman",serif;
        font-size:68px;
        line-height:.93;
        letter-spacing:-.06em;
        color:var(--gold);
      }
      .lede{
        margin:0;
        max-width:900px;
        font-size:22px;
        line-height:1.55;
        color:var(--muted);
      }
      .hero-side h3,.panel h2,.trace-card h3,.span-card h4,.callout h2{
        margin:10px 0 0;
        font-family:Georgia,"Times New Roman",serif;
        color:var(--gold);
        letter-spacing:-.04em;
      }
      .hero-side h3{font-size:34px;line-height:1}
      .panel h2,.callout h2{font-size:44px;line-height:1.02}
      .grid-2,.grid-3,.metrics,.trace-grid,.span-grid{
        display:grid;
        gap:18px;
      }
      .metrics{
        grid-template-columns:repeat(4,1fr);
        margin-bottom:20px;
      }
      .metric{
        padding:18px;
      }
      .metric-label{
        color:var(--muted);
        font-size:12px;
        text-transform:uppercase;
        letter-spacing:.18em;
      }
      .metric strong{
        display:block;
        margin:14px 0 10px;
        font-family:Georgia,"Times New Roman",serif;
        font-size:52px;
        line-height:.94;
        color:var(--gold);
      }
      .metric p,.panel p,.trace-card p,.span-card p,.hero-side p,.callout p,li{
        color:var(--muted);
        line-height:1.55;
      }
      .grid-2{grid-template-columns:1.08fr .92fr}
      .grid-3{grid-template-columns:repeat(3,1fr)}
      .trace-grid{grid-template-columns:repeat(3,1fr)}
      .span-grid{grid-template-columns:repeat(3,1fr)}
      .service-strip,.tag-row{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
      }
      .service{
        padding:10px 12px;
        border-radius:18px;
        border:1px solid rgba(104,140,196,.18);
        background:rgba(10,18,31,.66);
        color:var(--text);
        font-size:12px;
      }
      .tag{
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:8px 12px;
        border-radius:999px;
        border:1px solid rgba(104,140,196,.22);
        background:rgba(24,38,59,.84);
        font-size:12px;
        text-transform:uppercase;
        letter-spacing:.08em;
        font-weight:700;
      }
      .tag.good,.line.good{color:var(--good)}
      .tag.warn,.line.warn{color:var(--warn)}
      .tag.danger,.line.danger{color:var(--danger)}
      .mono{
        font-family:Consolas,Monaco,monospace;
        font-size:13px;
      }
      .muted-box,.code-block{
        padding:16px;
        border-radius:20px;
        border:1px solid rgba(104,140,196,.18);
        background:rgba(7,14,24,.76);
      }
      .line{
        display:flex;
        justify-content:space-between;
        gap:18px;
        padding:10px 0;
        border-bottom:1px solid rgba(104,140,196,.1);
      }
      .line:last-child{border-bottom:0}
      .trace-card,.span-card{
        padding:18px;
        min-height:100%;
      }
      .trace-card h3{font-size:28px;line-height:1.04}
      .span-card h4{font-size:22px;line-height:1.06}
      .span-meta{
        display:grid;
        grid-template-columns:repeat(2,1fr);
        gap:12px;
        margin-top:14px;
      }
      table{
        width:100%;
        border-collapse:collapse;
        margin-top:16px;
      }
      th,td{
        text-align:left;
        padding:15px 14px;
        border-bottom:1px solid rgba(104,140,196,.12);
        vertical-align:top;
      }
      th{
        color:var(--accent);
        font-size:12px;
        letter-spacing:.18em;
        text-transform:uppercase;
      }
      pre{
        margin:0;
        white-space:pre-wrap;
        word-break:break-word;
        color:var(--text);
        font-family:Consolas,Monaco,monospace;
        font-size:13px;
        line-height:1.55;
      }
      .footer-note{
        margin-top:16px;
        color:var(--muted-2);
        font-size:13px;
      }
      .nav-pills{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
      }
      .nav-pills a{
        text-decoration:none;
        color:var(--text);
        padding:10px 14px;
        border-radius:999px;
        border:1px solid rgba(104,140,196,.18);
        background:rgba(18,31,49,.72);
        font-size:13px;
        font-weight:600;
      }
      .nav-pills a.active{
        border-color:rgba(120,193,255,.34);
        background:rgba(120,193,255,.1);
        color:var(--accent);
      }
      @media (max-width:1180px){
        .hero,.grid-2,.trace-grid,.span-grid,.metrics{grid-template-columns:repeat(2,1fr)}
      }
      @media (max-width:820px){
        .shell{width:calc(100% - 20px);padding:14px}
        .hero,.grid-2,.grid-3,.trace-grid,.span-grid,.metrics{grid-template-columns:1fr}
        h1{font-size:48px}
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="topbar">
        <div class="brand">
          <div class="brand-mark">OTEL FRAUD SIGNAL TRACER</div>
          <div class="brand-route">${formatRouteLabel(current)}</div>
        </div>
        <div class="status-strip">
          <div class="chip"><span>Context</span>W3C Baggage</div>
          <div class="chip"><span>Coverage</span>${dashboard.baggageCoverage}%</div>
          <div class="chip"><span>Lead trace</span>${latest ? escape(latest.paymentId) : "none"}</div>
        </div>
      </section>
      ${body}
    </main>
  </body>
  </html>`;
}

export function renderOverview() {
  const dashboard = dashboardSummary();
  const traces = getTraces();
  const lead = traces[0];
  const hotTrace = [...traces].sort((left, right) => right.riskScore - left.riskScore)[0];

  return shell(
    "OTel Fraud Signal Tracer",
    "overview",
    `<section class="hero">
       <article class="hero-copy">
         <p class="eyebrow">Fraud context correlation</p>
         <h1>Every payment step still knows the fraud story it inherited.</h1>
         <p class="lede">This OpenTelemetry demo keeps risk score, rule triggers, and verdict context attached as payments move through ingest, authorization, ledger write, and alert fanout. The result is explainable observability instead of isolated spans and vague escalation noise.</p>
       </article>
       <article class="hero-side">
         <div class="nav-pills">${nav("overview")}</div>
         <div style="height:18px"></div>
         <p class="eyebrow">Control lane</p>
         <h3>${escape(dashboard.leadRecommendation)}</h3>
         <p>The strongest proof in this repo is not the trace count. It is that downstream services can still route, explain, and alert on the original fraud context without recreating the decision from scratch.</p>
         <div class="tag-row">
           <span class="tag ${lead ? badgeTone(lead.alertState) : "good"}">${lead ? escape(lead.alertState) : "quiet"} posture</span>
           <span class="tag ${hotTrace ? badgeTone(hotTrace.alertState) : "warn"}">${hotTrace ? hotTrace.riskScore : 0} peak risk</span>
         </div>
       </article>
     </section>
     <section class="metrics">
       <article class="metric"><div class="metric-label">Captured traces</div><strong>${dashboard.traceCount}</strong><p>Seeded payment runs plus any locally simulated scenarios.</p></article>
       <article class="metric"><div class="metric-label">Elevated traces</div><strong>${dashboard.elevatedTraces}</strong><p>Watch and escalated flows that should trigger operator review.</p></article>
       <article class="metric"><div class="metric-label">Declined payments</div><strong>${dashboard.declinedPayments}</strong><p>High-risk attempts that should not settle cleanly.</p></article>
       <article class="metric"><div class="metric-label">Average risk score</div><strong>${dashboard.avgRiskScore}</strong><p>Weighted pressure across the current payment sample set.</p></article>
     </section>
     <section class="grid-2">
       <article class="panel">
         <p class="eyebrow">Latest trace lane</p>
         <h2>Operator proof that baggage is not getting lost.</h2>
         <div class="trace-grid">
           ${traces.slice(0, 3).map((trace) => `<article class="trace-card">
             <span class="tag ${badgeTone(trace.alertState)}">${escape(trace.alertState)}</span>
             <h3>${escape(trace.merchant)}</h3>
             <p><span class="mono">${escape(trace.paymentId)}</span> ran at risk score <strong>${trace.riskScore}</strong> with a <strong>${escape(trace.verdict)}</strong> verdict.</p>
             <p>${escape(trace.triggerSummary)}</p>
             <p class="mono">${escape(trace.baggageHeader)}</p>
           </article>`).join("")}
         </div>
       </article>
       <article class="panel">
         <p class="eyebrow">What survives the handoff</p>
         <h2>Risk score, trigger context, and routing posture remain readable downstream.</h2>
         <div class="muted-box">
           <div class="line"><span>Fraud score</span><strong>${lead ? lead.riskScore : 0}</strong></div>
           <div class="line"><span>Lead verdict</span><strong>${lead ? escape(lead.verdict) : "allow"}</strong></div>
           <div class="line"><span>Lead merchant</span><strong>${lead ? escape(lead.merchant) : "None"}</strong></div>
           <div class="line"><span>Baggage contract</span><strong>riskScore + ruleTriggers + issuerRegion</strong></div>
         </div>
         <div class="service-strip" style="margin-top:16px">
           <span class="service">payment ingest</span>
           <span class="service">fraud score</span>
           <span class="service">policy route</span>
           <span class="service">issuer auth</span>
           <span class="service">ledger write</span>
           <span class="service">alert fanout</span>
         </div>
         <p class="footer-note">The Google AI Studio version pushed the shell harder. This real repo keeps that stronger control-room feel while staying honest about the API-first runtime underneath it.</p>
       </article>
     </section>`
  );
}

export function renderTraceBoard() {
  const traces = getTraces();

  return shell(
    "Trace Board",
    "traces",
    `<section class="hero">
       <article class="hero-copy">
         <p class="eyebrow">Trace board</p>
         <h1>Each service step can still see the fraud story it inherited.</h1>
         <p class="lede">The trace board turns spans into payment decisions. Every card shows how the fraud context survives service boundaries, what each service knew, and why the final route ended in allow, review, or decline.</p>
       </article>
       <article class="hero-side">
         <div class="nav-pills">${nav("traces")}</div>
         <p class="eyebrow" style="margin-top:20px">Trace posture</p>
         <h3>${traces.length} correlated payment stories</h3>
         <p>The point is not just distributed tracing. The point is preserved decision intent that downstream teams can explain to fraud ops, finance, and compliance.</p>
       </article>
     </section>
     ${traces.map((trace) => `<section class="panel" style="margin-bottom:18px">
       <div class="tag-row">
         <span class="tag ${badgeTone(trace.alertState)}">${escape(trace.alertState)}</span>
         <span class="tag">${escape(trace.verdict)} verdict</span>
         <span class="tag">${trace.riskScore} risk score</span>
       </div>
       <h2>${escape(trace.merchant)} · ${escape(trace.paymentId)}</h2>
       <p>${verdictCopy(trace)}</p>
       <div class="grid-2">
         <div class="muted-box">
           <p class="eyebrow">Inherited baggage</p>
           <pre>${escape(trace.baggageHeader)}</pre>
         </div>
         <div class="muted-box">
           <p class="eyebrow">Trigger summary</p>
           <pre>${escape(trace.triggerSummary)}</pre>
         </div>
       </div>
       <div class="span-grid" style="margin-top:18px">
         ${trace.spans.map((span) => `<article class="span-card">
           <h4>${escape(span.name)}</h4>
           <p>${escape(span.service)} carried the fraud context for <strong>${span.durationMs} ms</strong> and saw risk score <strong>${escape(span.riskScore)}</strong>.</p>
           <div class="span-meta">
             <div class="muted-box"><span class="eyebrow">Triggers</span><p>${escape(span.triggers)}</p></div>
             <div class="muted-box"><span class="eyebrow">Status</span><p>${escape(span.status)}</p></div>
           </div>
         </article>`).join("")}
       </div>
     </section>`).join("")}`
  );
}

export function renderDocs() {
  return shell(
    "Docs",
    "docs",
    `<section class="hero">
       <article class="hero-copy">
         <p class="eyebrow">Docs lane</p>
         <h1>Runs instantly in memory, then expands into a collector-backed fraud trace path.</h1>
         <p class="lede">Local-first mode keeps this repo one-shot and readable. When you want the broader observability story, the same baggage propagation model can flow through the bundled collector and Jaeger compose lane.</p>
       </article>
       <article class="hero-side">
         <div class="nav-pills">${nav("docs")}</div>
         <p class="eyebrow" style="margin-top:20px">Key proof</p>
         <h3>Small route surface, strong observability story.</h3>
         <p>This repo stays clear because the narrative is compact: payment risk enters once, baggage survives each service hop, and downstream alerts can explain themselves.</p>
       </article>
     </section>
     <section class="grid-2">
       <article class="panel">
         <p class="eyebrow">Runtime routes</p>
         <h2>What the operator can inspect immediately.</h2>
         <table>
           <thead><tr><th>Route</th><th>Purpose</th></tr></thead>
           <tbody>
             <tr><td><span class="mono">GET /</span></td><td>Executive overview for fraud context propagation posture.</td></tr>
             <tr><td><span class="mono">GET /traces</span></td><td>Trace board showing span-by-span baggage continuity.</td></tr>
             <tr><td><span class="mono">GET /verification</span></td><td>Human-readable verification surface replacing the old raw JSON screenshot lane.</td></tr>
             <tr><td><span class="mono">GET /api/dashboard/summary</span></td><td>Machine-readable summary for trace posture and lead recommendations.</td></tr>
             <tr><td><span class="mono">POST /api/simulate</span></td><td>Creates a fresh fraud-correlated payment trace.</td></tr>
           </tbody>
         </table>
       </article>
       <article class="panel">
         <p class="eyebrow">Compose lane</p>
         <h2>Collector and Jaeger stay optional.</h2>
         <div class="code-block">
           <pre>docker compose --profile observability up --build

OpenTelemetry Collector
Jaeger all-in-one
OTLP export path for the same baggage-aware spans</pre>
         </div>
         <p style="margin-top:16px">That keeps the repo lightweight for local review while still proving a broader observability topology when you want to show the collector story.</p>
         <div class="service-strip" style="margin-top:16px">
           <span class="service">OTLP export</span>
           <span class="service">collector processor</span>
           <span class="service">Jaeger visualization</span>
           <span class="service">fraud alert correlation</span>
         </div>
       </article>
     </section>`
  );
}

export function renderVerification() {
  const dashboard = dashboardSummary();
  const traces = getTraces().slice(0, 2);

  return shell(
    "Verification",
    "verification",
    `<section class="hero">
       <article class="hero-copy">
         <p class="eyebrow">Verification lane</p>
         <h1>Fraud baggage reaches alerting without dropping its story.</h1>
         <p class="lede">This view replaces the old raw JSON screenshot. It gives the same summary data in a way that is readable, screenshot-safe, and much closer to how an operator or reviewer would actually evaluate the trace posture.</p>
       </article>
       <article class="hero-side">
         <div class="nav-pills">${nav("verification")}</div>
         <p class="eyebrow" style="margin-top:20px">Current summary</p>
         <h3>${dashboard.traceCount} traces · ${dashboard.baggageCoverage}% coverage</h3>
         <p>Elevated traces: <strong>${dashboard.elevatedTraces}</strong>. Declined payments: <strong>${dashboard.declinedPayments}</strong>. Average risk score: <strong>${dashboard.avgRiskScore}</strong>.</p>
       </article>
     </section>
     <section class="grid-2">
       <article class="panel">
         <p class="eyebrow">Lead evidence</p>
         <h2>Human-readable trace posture.</h2>
         <table>
           <thead><tr><th>Payment</th><th>Merchant</th><th>Risk</th><th>Verdict</th><th>Alert</th></tr></thead>
           <tbody>
             ${traces.map((trace) => `<tr>
               <td><span class="mono">${escape(trace.paymentId)}</span></td>
               <td>${escape(trace.merchant)}</td>
               <td>${trace.riskScore}</td>
               <td>${escape(trace.verdict)}</td>
               <td class="${badgeTone(trace.alertState)}">${escape(trace.alertState)}</td>
             </tr>`).join("")}
           </tbody>
         </table>
         <p class="footer-note">${escape(dashboard.leadRecommendation)}</p>
       </article>
       <article class="panel">
         <p class="eyebrow">API contract</p>
         <h2>Same information, cleaner proof surface.</h2>
         <div class="code-block">
           <pre>${escape(JSON.stringify({
             dashboard,
             traces: traces.map((trace) => ({
               traceId: trace.traceId,
               paymentId: trace.paymentId,
               merchant: trace.merchant,
               riskScore: trace.riskScore,
               verdict: trace.verdict,
               alertState: trace.alertState
             }))
           }, null, 2))}</pre>
         </div>
       </article>
     </section>
     <section class="callout">
       <p class="eyebrow">Verification checklist</p>
       <h2>Check the overview, inspect the traces, then compare the API summary against this page.</h2>
       <p>The repo now has a cleaner proof ladder: visual overview, visual trace board, compact docs lane, and a verification surface that makes the summary payload screenshotable without the dead space or raw-browser awkwardness from before.</p>
     </section>`
  );
}
