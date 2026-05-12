import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? "4378");
const app = createApp();

app.listen(port, "127.0.0.1", () => {
  console.log(`OTel Fraud Signal Tracer listening on http://127.0.0.1:${port}`);
});
